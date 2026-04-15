import React, { useState, useRef } from 'react';
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';

const VoiceTextField = ({ value, onChange, label, name, SpeechIconProps, ...props }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    // 1. If currently recording, stop it immediately.
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not natively support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    // 2. Capture the EXACT text present in the field at the very millisecond the user clicked "Record"
    const textAtStartOfRecording = value || '';

    // 3. Initialize fresh engine
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    // We use continuous and interimResults so we can stream LIVE text into the UI exactly as the user speaks!
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentSessionTranscript = '';
      
      // Loop through absolutely everything the user has said in THIS recording session
      for (let i = 0; i < event.results.length; ++i) {
        currentSessionTranscript += event.results[i][0].transcript;
      }
      
      if (currentSessionTranscript) {
        const spacing = textAtStartOfRecording && !textAtStartOfRecording.endsWith(' ') ? ' ' : '';
        
        // Magically append the live spoken stream to the frozen initial text!
        // Because "textAtStartOfRecording" never changes during this session, the text streams flawlessly without duplicating!
        const liveNewValue = textAtStartOfRecording + spacing + currentSessionTranscript;
        
        if (onChange) {
          onChange({
             target: {
                name: name,
                value: liveNewValue
             }
          });
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        alert("Microphone access is blocked! Please click 'Allow' in your browser URL bar.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Could not start recognition:', e);
      setIsListening(false);
    }
  };

  return (
    <TextField
      value={value}
      onChange={onChange}
      label={label}
      name={name}
      {...props}
      InputProps={{
        ...props.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            {props.InputProps?.endAdornment}
            <Tooltip title={isListening ? "Stop listening" : "Dictate"}>
              <IconButton 
                onClick={toggleListening} 
                color={isListening ? 'error' : 'default'}
                sx={{
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
                    '70%': { transform: 'scale(1.1)', boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
                    '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' }
                  }
                }}
                {...SpeechIconProps}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default VoiceTextField;