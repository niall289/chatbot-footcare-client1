/**
 * FootCare Clinic Chatbot Widget
 * A professional chat widget that can be embedded on any website.
 */

(function() {
  // Store widget config globally
  let config = {
    botName: 'Fiona',
    clinicLocation: 'all',
    allowImageUpload: true,
    theme: 'teal',
    position: 'right' // 'right' or 'left'
  };

  // Create widget CSS
  const createStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.id = 'fc-chat-styles';
    styleEl.innerHTML = `
      #fc-chat-widget-button {
        position: fixed;
        ${config.position === 'right' ? 'right' : 'left'}: 20px;
        bottom: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${config.theme === 'teal' ? '#00847e' : '#4CAF50'};
        color: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9998;
        transition: all 0.3s ease;
        border: none;
      }
      
      #fc-chat-widget-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
      }
      
      #fc-chat-widget-button img {
        width: 30px;
        height: 30px;
      }
      
      #fc-chat-widget-container {
        position: fixed;
        ${config.position === 'right' ? 'right' : 'left'}: 20px;
        bottom: 90px;
        width: 350px;
        height: 500px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
        z-index: 9999;
        overflow: hidden;
        display: none;
        flex-direction: column;
        transition: all 0.3s ease;
      }
      
      #fc-chat-widget-header {
        background-color: ${config.theme === 'teal' ? '#00847e' : '#4CAF50'};
        color: white;
        padding: 12px 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      #fc-chat-widget-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      
      #fc-chat-widget-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        width: 24px;
        height: 24px;
      }
      
      #fc-chat-widget-iframe {
        flex: 1;
        border: none;
        width: 100%;
        height: 100%;
      }
      
      @media (max-width: 480px) {
        #fc-chat-widget-container {
          width: 90%;
          height: 70vh;
          right: 5%;
          left: 5%;
          bottom: 15%;
        }
      }
    `;
    document.head.appendChild(styleEl);
  };

  // Create chat button with nurse avatar
  const createChatButton = () => {
    const button = document.createElement('button');
    button.id = 'fc-chat-widget-button';
    button.title = `Chat with ${config.botName}`;
    button.setAttribute('aria-label', `Open ${config.botName} chat assistant`);
    
    // Nurse icon - either use an SVG or a hosted image
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    // Add click event
    button.addEventListener('click', toggleChatWidget);
    
    document.body.appendChild(button);
  };

  // Create container for the iframe
  const createChatContainer = () => {
    const container = document.createElement('div');
    container.id = 'fc-chat-widget-container';
    
    // Header
    const header = document.createElement('div');
    header.id = 'fc-chat-widget-header';
    
    // Title with nurse name
    const title = document.createElement('h3');
    title.textContent = `Chat with ${config.botName}`;
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.id = 'fc-chat-widget-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close chat');
    closeButton.addEventListener('click', toggleChatWidget);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create iframe for chat content
    const iframe = document.createElement('iframe');
    iframe.id = 'fc-chat-widget-iframe';
    
    // Set iframe source with configuration parameters
    const srcUrl = new URL('/chat', window.location.origin);
    srcUrl.searchParams.append('embedded', 'true');
    srcUrl.searchParams.append('botName', config.botName);
    srcUrl.searchParams.append('clinicLocation', config.clinicLocation);
    srcUrl.searchParams.append('allowImageUpload', config.allowImageUpload.toString());
    srcUrl.searchParams.append('theme', config.theme);
    
    iframe.src = srcUrl.toString();
    
    // Append all elements
    container.appendChild(header);
    container.appendChild(iframe);
    document.body.appendChild(container);
  };

  // Toggle chat widget visibility
  const toggleChatWidget = () => {
    const container = document.getElementById('fc-chat-widget-container');
    if (container.style.display === 'none' || container.style.display === '') {
      container.style.display = 'flex';
      // Focus on iframe for accessibility
      setTimeout(() => {
        document.getElementById('fc-chat-widget-iframe').focus();
      }, 300);
    } else {
      container.style.display = 'none';
    }
  };

  // Initialize function called by the main script
  window.fcChat = function(action, options) {
    if (action === 'init') {
      // Merge default config with user options
      if (options) {
        config = {...config, ...options};
      }
      
      // Initialize widget
      createStyles();
      createChatButton();
      createChatContainer();
    }
  };

  // Auto-initialize if fcChat was called before this script loaded
  if (window.fcChat.q) {
    for (let i = 0; i < window.fcChat.q.length; i++) {
      const args = window.fcChat.q[i];
      window.fcChat(args[0], args[1]);
    }
  }
})();