import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/layout/Modal';
import { uploadImageToImgBB } from '../../../utils/imgbbUpload';

// Add this to the top of your FingerprintScannerModal.tsx file
declare global {
    interface Window {
      test: any;
      FingerprintSdkTest: any;
      onStart: () => void;
      onStop: () => void;
      onClear: () => void;
      onGetInfo: () => void;
      readersDropDownPopulate: (redirect: boolean) => void;
      selectChangeEvent: () => void;
      Fingerprint: any;
      state: any; // Add the state property
      myVal: string; // Add other app.js global variables as needed
      disabled: boolean;
      startEnroll: boolean;
      currentFormat: any;
      
    }
  }
  
interface FingerprintScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFingerprintCaptured: (fingerprintUrl: string) => void;
}

// The SDK and test object will be accessed from window
declare global {
  interface Window {
    test: any;
    FingerprintSdkTest: any;
    onStart: () => void;
    onStop: () => void;
    onClear: () => void;
    onGetInfo: () => void;
    readersDropDownPopulate: (redirect: boolean) => void;
    selectChangeEvent: () => void;
    Fingerprint: any;
  }
}

const FingerprintScannerModal: React.FC<FingerprintScannerModalProps> = ({ 
  isOpen, 
  onClose, 
  onFingerprintCaptured 
}) => {
  const [status, setStatus] = useState<string>('Esperando lector de huellas');
  const [loading, setLoading] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Create a container for the app.js content
  const captureContainerId = 'content-capture-react';
  const readerContainerId = 'content-reader-react';
  
  // Initialize the fingerprint scanner when modal opens
  useEffect(() => {
    if (isOpen) {
      // We need to wait for the DOM to load before initializing
      setTimeout(() => {
        initializeFingerprintScanner();
      }, 500);
    }
    
    // Clean up when modal closes
    return () => {
      if (window.test && window.test.acquisitionStarted) {
        window.onStop();
      }
    };
  }, [isOpen]);
  
  const initializeFingerprintScanner = () => {
    try {
      // Set up necessary DOM elements for app.js to work with
      setupDomForAppJs();
      
      // Use the global function to populate readers
      window.readersDropDownPopulate(false);
      
      setStatus('Lector inicializado. Seleccione un lector de la lista.');
    } catch (error: any) {
      setStatus(`Error al inicializar: ${error.message}`);
      console.error('Initialization error:', error);
    }
  };
  
  const setupDomForAppJs = () => {
    // Create the necessary elements that app.js expects
    const captureContainer = document.getElementById(captureContainerId);
    if (captureContainer) {
      captureContainer.innerHTML = `
        <div id="status">Listo para capturar huella</div>
        <div id="imagediv"></div>
        <div id="Scores" style="display:block;">
          <h5>Scan Quality : <input type="text" id="qualityInputBox" size="20" style="background-color:#DCDCDC;text-align:center;"></h5>
        </div>
      `;
      
      // Set the global state variable from app.js to point to our container
      window.state = captureContainer;
    }
  };

  useEffect(() => {
    // Make sure window.state is properly set to our container
    const captureContainer = document.getElementById(captureContainerId);
    if (captureContainer && window.test) {
      window.state = captureContainer;
    }
  }, []);
  
  const startCapture = () => {
    try {
      // Make sure state is properly set
      const captureContainer = document.getElementById(captureContainerId);
      if (captureContainer) {
        window.state = captureContainer;
      }
      
      // Directly check the PNG format checkbox
      document.querySelectorAll('input[name="PngImage"]').forEach(input => {
        (input as HTMLInputElement).checked = true;
      });
      
      // Uncheck other format checkboxes
      ['Raw', 'Intermediate', 'Compressed'].forEach(name => {
        document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
          (input as HTMLInputElement).checked = false;
        });
      });
      
      // Force set the format
      window.currentFormat = window.Fingerprint.SampleFormat.PngImage;
      
      // Call the global onStart function
      window.onStart();
      setStatus('Capturando huella. Coloque su dedo en el lector.');
    } catch (error: any) {
      setStatus(`Error al iniciar captura: ${error.message}`);
    }
  };
  
  const stopCapture = () => {
    try {
      // Call the global onStop function
      window.onStop();
      setStatus('Captura detenida.');
    } catch (error: any) {
      setStatus(`Error al detener captura: ${error.message}`);
    }
  };
  
  const clearFingerprint = () => {
    try {
      // Call the global onClear function
      window.onClear();
      setStatus('Imagen limpiada.');
    } catch (error: any) {
      setStatus(`Error al limpiar: ${error.message}`);
    }
  };
  
  const saveFingerprint = async () => {
    // Check if an image is available in localStorage (set by app.js)
    const fingerprintImage = localStorage.getItem('imageSrc');
    
    if (!fingerprintImage) {
      setStatus('No hay huella para guardar. Capture una huella primero.');
      return;
    }
    
    setLoading(true);
    setStatus('Guardando huella...');
    
    try {
      // Convert base64 image to a file
      const response = await fetch(fingerprintImage);
      const blob = await response.blob();
      const file = new File([blob], "fingerprint.png", { type: "image/png" });
      
      // Upload to ImgBB
      const uploadResult = await uploadImageToImgBB(file);
      
      if (uploadResult.success) {
        setStatus('Huella guardada exitosamente');
        // Pass the URL back to the parent component
        onFingerprintCaptured(uploadResult.url);
        // Close after a brief delay
        setTimeout(() => onClose(), 1000);
      } else {
        setStatus(`Error al subir la imagen: ${uploadResult.error}`);
      }
    } catch (error: any) {
      setStatus(`Error al guardar la huella: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escanear Huella Digital" size="lg">
      <div className="space-y-4" ref={modalRef}>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-white mb-2 font-medium">Estado: {status}</p>
        </div>
        
        {/* Readers dropdown from app.js */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h4 className="text-white mb-2 font-medium">Seleccionar Lector:</h4>
          <select
            id="readersDropDown"
            onChange={() => window.selectChangeEvent()}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="">Seleccione un lector</option>
          </select>
          
          <div className="flex flex-wrap mt-4 gap-2">
            <button
              type="button"
              onClick={() => window.readersDropDownPopulate(false)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Actualizar Lista
            </button>
          </div>
        </div>
        
        {/* Container for app.js to inject its content */}
       {/* Container for app.js to inject its content */}
<div id={captureContainerId} className="border border-gray-700 rounded-lg p-4">
  <div id="status">Listo para capturar huella</div>
  <div id="imagediv" className="min-h-40 flex items-center justify-center"></div>
  <div id="Scores" style={{ display: 'block' }}>
    <h5>Scan Quality: <input type="text" id="qualityInputBox" size={20} style={{ backgroundColor: '#DCDCDC', textAlign: 'center' }} /></h5>
  </div>
  
  {/* Add form for format selection */}
  <div id="saveAndFormats" className="mt-4">
    <form name="myForm" style={{ border: 'solid grey', padding: '5px' }}>
      <b>Acquire Formats:</b><br />
      <table>
        <tbody>
          <tr>
            <td>
              <input type="checkbox" name="Raw" value="1" /> RAW<br />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" name="Intermediate" value="2" /> Feature Set<br />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" name="Compressed" value="3" /> WSQ<br />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" name="PngImage" checked value="4" /> PNG
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
  
  <div id="imageGallery"></div>
  <div id="deviceInfo"></div>
</div>
        
        {/* Hidden container for reader content */}
        <div id={readerContainerId} style={{ display: 'none' }}></div>
        
        {/* Hidden form for format selection */}
        <div style={{ display: 'none' }}>
          <form name="myForm" id="myForm">
            <input type="checkbox" name="PngImage" checked value="4" />
          </form>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={clearFingerprint}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={startCapture}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Escaneo
          </button>
          <button
            type="button"
            onClick={stopCapture}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Detener Escaneo
          </button>
          <button
            type="button"
            onClick={saveFingerprint}
            disabled={loading}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'} transition-colors`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Huella'
            )}
          </button>
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FingerprintScannerModal;