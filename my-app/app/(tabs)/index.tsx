import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import patientData from '../Data/patients.json'
import config from '../config';

const genAI = new GoogleGenerativeAI(config.API_KEY);
interface Message {
  type: 'patient' | 'ai' | 'user';
  text: string;
}

export default function TabOneScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentPatient, setCurrentPatient] = useState(0);
  const [gameState, setGameState] = useState<'TESTING' | 'DIAGNOSIS'>('TESTING');
  const [totalScore, setTotalScore] = useState(0);
  const [testScore, setTestScore] = useState<number | null>(null);
  const [diagnosisScore, setDiagnosisScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      console.log("Received message:", event.data);
      addAIMessage(event.data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    startNewPatient();
  }, [currentPatient]);

  const startNewPatient = () => {
    const patient = patientData.patients[currentPatient];
    setMessages([
      {
        type: 'patient',
        text: `Hi, Dr. Vishnu. Good to see you. ${patient.patient.history}. ${patient.patient.symptoms}`,
      },
    ]);
    addAIMessage(
      `The patient is a ${patient.patient.age}-year-old ${patient.patient.gender.toLowerCase()}. ${patient.patient.additionalInfo}. These symptoms warrant further investigation. What test should we run?`
    );
    setGameState('TESTING');
    setTestScore(null);
    setDiagnosisScore(null);
    setAttempts(0);
  };

  const addAIMessage = (text: string) => {
    setMessages((prev) => [...prev, { type: 'ai', text }]);
    animateMessage();
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { type: 'user', text }]);
    animateMessage();
  };

  const animateMessage = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const evaluateResponse = async (userText: string, phase: 'TESTING' | 'DIAGNOSIS') => {
    const patient = patientData.patients[currentPatient];
    const prompt = `
      Act as a senior doctor guiding a junior doctor.
      Patient: ${patient.patient.age}-year-old ${patient.patient.gender} with ${patient.patient.symptoms}.
      ${phase === 'TESTING' ? 'Correct test would be: ' + patient.correctTest : 'Correct diagnosis would be: ' + patient.correctDiagnosis}.
      Junior doctor's response: ${userText}.
      Evaluate the junior doctor's response. If it is correct, simply acknowledge it and move to the next step. If it is incorrect, provide a small explanation about why it might not work and suggest thinking further. Do not reveal the correct answer directly.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    console.log('AI Response:', result.response.text());
    return result.response.text();
  };
  const handleSubmit = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);

    const userText = inputText.trim();
    addUserMessage(userText);
    setInputText('');

    const patient = patientData.patients[currentPatient];

    try {
      const evaluation = await evaluateResponse(userText, gameState);

      if (gameState === 'TESTING') {
        if (userText.toLowerCase().includes(patient.correctTest.toLowerCase())) {
          setTestScore(5 - attempts * 2);
          addAIMessage(
            `Great choice, Doctor! Here are the results from the report:\n${patient.patient.additionalInfo}\nWhat is the differential diagnosis we should be doing?`
          );
          setGameState('DIAGNOSIS');
        } else {
          addAIMessage(evaluation);
          setAttempts((prev) => prev + 1);
        }
      } else if (gameState === 'DIAGNOSIS') {
        if (userText.toLowerCase().includes(patient.correctDiagnosis.toLowerCase())) {
          setDiagnosisScore(5 - attempts * 2);
          addAIMessage(
            `Correct diagnosis, Doctor! The patient indeed has ${patient.correctDiagnosis}.`
          );
          setTotalScore((prev) => prev + (testScore || 0) + (5 - attempts * 2));
        } else {
          addAIMessage(evaluation);
          setAttempts((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addAIMessage('There was an error processing your response. Please try again.');
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const savePatientDetails = async () => {
    const pattientDetails = {
      age: patientData.patients[currentPatient].patient.age,
      gender: patientData.patients[currentPatient].patient.gender,
      symptoms: patientData.patients[currentPatient].patient.symptoms,
      history: messages,
      additional_info: patientData.patients[currentPatient].patient.additionalInfo,
    };
    try{
      const response = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pattientDetails),
      });
      console.log("Response api call:", response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error saving patient details:', error);
    }
  }

  const handleNextPatient = async () => {
    await savePatientDetails();
    if (currentPatient < patientData.patients.length - 1) {
      setCurrentPatient((prev) => prev + 1);
    } else {
      alert('Training complete! Well done!');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <Animated.View
            key={index}
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.otherMessage,
              { opacity: fadeAnim },
            ]}
          >
            {message.type === 'patient' && (
              <Text style={styles.patientLabel}>
                <Icon name="person" size={16} color="#FF9500" /> PATIENT
              </Text>
            )}
            {message.type === 'ai' && (
              <Text style={styles.aiLabel}>
                <Icon name="medical-services" size={16} color="#4CD964" /> SENIOR AI DOCTOR
              </Text>
            )}
            {message.type === 'user' && (
              <Text style={styles.userLabel}>
                <Icon name="person" size={16} color="#0000ff" /> YOU
              </Text>
            )}
            <Text style={styles.messageText}>{message.text}</Text>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your response..."
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSubmit} disabled={isLoading}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>

        {diagnosisScore !== null && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextPatient}>
            <Text style={styles.buttonText}>Next Patient</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Total Score: {totalScore}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFC0CB',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  patientLabel: {
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 5,
  },
  aiLabel: {
    fontWeight: 'bold',
    color: '#4CD964',
    marginBottom: 5,
  },
  userLabel: {
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#4CD964',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  scoreContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});