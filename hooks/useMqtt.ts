import { useState, useEffect, useRef, useCallback } from 'react';
import { MqttStatus, ZoneConfig } from '../types';

// MQTT Topics from the Python script
const TOPIC_IMAGE_LATEST = "cat_detector/image/latest";
const TOPIC_DETECTION_STATUS = "cat_detector/status/detection";
const TOPIC_SERVO_COMMAND = "servo/control";
const TOPIC_SCRIPT_CONFIG_SET = "cat_detector/config/script/set";
const TOPIC_ZONES_CONFIG_SET = "cat_detector/config/zones/set";


// Note: Paho is loaded from a script tag in index.html, so we declare it here.
declare const Paho: any;

export const useMqtt = (brokerHost: string | null, brokerPort: number | null) => {
  const [status, setStatus] = useState<MqttStatus>(MqttStatus.Disconnected);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<string>('Awaiting connection...');
  const clientRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (!brokerHost || !brokerPort) {
        setDetectionStatus("Broker not configured.");
        setStatus(MqttStatus.Disconnected);
        return;
    }
    if (clientRef.current && clientRef.current.isConnected()) {
      return;
    }
    setStatus(MqttStatus.Connecting);
    try {
      const clientId = `cat-detector-gui-${Math.random().toString(16).substr(2, 8)}`;
      // Use Paho.Client for v1.1.0
      const client = new Paho.Client(brokerHost, brokerPort, clientId);

      client.onConnectionLost = (responseObject: any) => {
        if (responseObject.errorCode !== 0) {
          console.error("MQTT Connection Lost:", responseObject.errorMessage);
          setStatus(MqttStatus.Error);
          setDetectionStatus(`Connection lost: ${responseObject.errorMessage}`);
          // Attempt to reconnect after a delay
          setTimeout(connect, 5000);
        }
      };

      client.onMessageArrived = (message: any) => {
        if (message.destinationName === TOPIC_IMAGE_LATEST) {
          // The payload is the raw image data, not a base64 string in a string.
          // The python script now sends a b64 string, so we just read it.
          setLatestImage(message.payloadString);
        } else if (message.destinationName === TOPIC_DETECTION_STATUS) {
          setDetectionStatus(message.payloadString);
        }
      };

      client.connect({
        onSuccess: () => {
          console.log("MQTT Connected!");
          setStatus(MqttStatus.Connected);
          setDetectionStatus("Connected and monitoring...");
          client.subscribe(TOPIC_IMAGE_LATEST, { qos: 0 });
          client.subscribe(TOPIC_DETECTION_STATUS);
        },
        onFailure: (responseObject: any) => {
          console.error("MQTT Connection Failed:", responseObject.errorMessage);
          setStatus(MqttStatus.Error);
          setDetectionStatus(`Connection failed: ${responseObject.errorMessage}. Check broker settings.`);
        },
        // useSSL is false for ws:// connection in local docker setup
        useSSL: false, 
        reconnect: true,
        timeout: 5,
      });

      clientRef.current = client;
    } catch (error) {
      console.error("MQTT client initialization failed:", error);
      setStatus(MqttStatus.Error);
      setDetectionStatus("Failed to initialize MQTT client. Check host/port.");
    }
  }, [brokerHost, brokerPort]);

  useEffect(() => {
    connect();

    return () => {
      if (clientRef.current && clientRef.current.isConnected()) {
        try {
            clientRef.current.disconnect();
            console.log("MQTT Disconnected on cleanup.");
        } catch(e) {
            console.error("Error during MQTT disconnect", e);
        }
      }
    };
  }, [connect]);
  
  const publish = useCallback((topic: string, payload: string) => {
    if (clientRef.current && clientRef.current.isConnected()) {
      clientRef.current.send(topic, payload, 0, false);
    } else {
      console.warn("Cannot publish, MQTT client not connected.");
      setDetectionStatus("Cannot publish: Not connected.");
    }
  }, []);

  const sendScriptConfig = useCallback((config: { confidence?: number, cooldown?: number }) => {
    publish(TOPIC_SCRIPT_CONFIG_SET, JSON.stringify(config));
  }, [publish]);
    
  const sendZoneConfig = useCallback((config: ZoneConfig) => {
    // The python script expects zones as lists of lists, not objects with x/y
    const payload = {
        ...config,
        activation_areas: config.activation_areas.map(zone => zone.map(point => [point.x, point.y]))
    }
    publish(TOPIC_ZONES_CONFIG_SET, JSON.stringify(payload));
  }, [publish]);

  const sendServoCommand = useCallback((command: 'activate' | 'deactivate') => {
    publish(TOPIC_SERVO_COMMAND, command);
  }, [publish]);

  return { status, latestImage, detectionStatus, sendScriptConfig, sendServoCommand, sendZoneConfig };
};