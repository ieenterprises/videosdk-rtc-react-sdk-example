
import { useEffect } from 'react';

const TawkToChat = ({ isVisible = true }) => {
  useEffect(() => {
    if (!isVisible) {
      // If not visible, remove any existing Tawk elements and return early
      cleanupTawkElements();
      return;
    }

    // Only create Tawk chat if it should be visible
    // Create container div
    const containerDiv = document.createElement('div');
    containerDiv.id = 'tawk_6616a163a0c6737bd12a56c8';
    document.body.appendChild(containerDiv);
    
    // Create and insert Tawk.to script
    var Tawk_API = window.Tawk_API || {};
    var Tawk_LoadStart = new Date();
    Tawk_API.embedded = 'tawk_6616a163a0c6737bd12a56c8';
    
    const script = document.createElement("script");
    script.id = 'tawk-to-script';
    script.async = true;
    script.src = 'https://embed.tawk.to/6616a163a0c6737bd12a56c8/1ilrgsu2o';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    document.body.appendChild(script);

    // Add custom styling for positioning the chat widget at bottom left
    const style = document.createElement('style');
    style.textContent = `
      .tawk-min-container {
        margin: 0 !important;
        left: 20px !important;
        right: auto !important;
        bottom: 20px !important;
      }
    `;
    document.head.appendChild(style);

    // Clean up function to remove the script and container when component unmounts
    return () => {
      cleanupTawkElements();
      document.head.removeChild(style);
    };
  }, [isVisible]);

  const cleanupTawkElements = () => {
    // Remove the script
    const tawkScript = document.getElementById('tawk-to-script');
    if(tawkScript && tawkScript.parentNode) {
      tawkScript.parentNode.removeChild(tawkScript);
    }
    
    // Remove the container
    const containerDiv = document.getElementById('tawk_6616a163a0c6737bd12a56c8');
    if (containerDiv) {
      containerDiv.remove();
    }
    
    // Remove Tawk iframe and widget elements
    const tawkIframes = document.querySelectorAll('iframe[src*="tawk.to"]');
    tawkIframes.forEach(iframe => iframe.remove());
    
    const tawkWidgets = document.querySelectorAll('.tawk-min-container, .tawk-card, .tawk-chat-panel, .tawk-widget');
    tawkWidgets.forEach(widget => widget.remove());
  };

  return null;
};

export default TawkToChat;
