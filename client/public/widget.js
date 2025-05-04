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
        ${config.position === 'right' ? 'right' : 'left'}: 25px;
        bottom: 25px;
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
        animation: fc-pulse 2s infinite;
      }
      
      @keyframes fc-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      #fc-chat-widget-button:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
        animation: none;
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
        #fc-chat-widget-button {
          bottom: 15px;
          ${config.position === 'right' ? 'right' : 'left'}: calc(50% - 25px);
          width: 50px;
          height: 50px;
        }
        
        #fc-chat-widget-container {
          width: 90%;
          max-width: 360px;
          height: 70vh;
          right: 5%;
          left: 5%;
          bottom: 75px;
          margin: 0 auto;
        }
        
        #fc-chat-widget-button svg {
          width: 24px;
          height: 24px;
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
    
    // Use Fiona's avatar image
    const buttonStyle = window.innerWidth <= 480 ? 'width: 32px; height: 32px;' : 'width: 40px; height: 40px;';
    
    button.innerHTML = `
      <img src="fiona-avatar-circle.svg" alt="Fiona - FootCare Clinic Nurse" style="${buttonStyle}; border-radius: 50%;">
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
    
    // Header with nurse avatar and name
    const headerContent = document.createElement('div');
    headerContent.style.display = 'flex';
    headerContent.style.alignItems = 'center';
    
    // Add nurse avatar
    const nurseAvatar = document.createElement('img');
    nurseAvatar.src = 'fiona-avatar-circle.svg';
    nurseAvatar.alt = `${config.botName} - FootCare Clinic Nurse`;
    nurseAvatar.style.width = '28px';
    nurseAvatar.style.height = '28px';
    nurseAvatar.style.marginRight = '10px';
    nurseAvatar.style.borderRadius = '50%';
    
    // Title with nurse name
    const title = document.createElement('h3');
    title.textContent = `Chat with ${config.botName}`;
    title.style.margin = '0';
    
    headerContent.appendChild(nurseAvatar);
    headerContent.appendChild(title);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.id = 'fc-chat-widget-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close chat');
    closeButton.addEventListener('click', toggleChatWidget);
    
    header.appendChild(headerContent);
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
      // Store widget state in localStorage
      try {
        localStorage.setItem('fc_chat_widget_open', 'true');
      } catch (e) {
        console.warn('Unable to save chat state to localStorage');
      }
      // Focus on iframe for accessibility
      setTimeout(() => {
        document.getElementById('fc-chat-widget-iframe').focus();
      }, 300);
      
      // Set inactive timeout to minimize after 5 minutes of inactivity
      resetInactiveTimeout();
    } else {
      container.style.display = 'none';
      // Update localStorage state
      try {
        localStorage.setItem('fc_chat_widget_open', 'false');
      } catch (e) {
        console.warn('Unable to save chat state to localStorage');
      }
      // Clear inactive timeout when chat is closed
      clearInactiveTimeout();
    }
  };
  
  // Timeout variable for inactivity
  let inactiveTimeout;
  
  // Reset inactive timeout
  const resetInactiveTimeout = () => {
    clearInactiveTimeout();
    inactiveTimeout = setTimeout(() => {
      const container = document.getElementById('fc-chat-widget-container');
      if (container && container.style.display === 'flex') {
        container.style.display = 'none';
        try {
          localStorage.setItem('fc_chat_widget_open', 'false');
        } catch (e) {
          console.warn('Unable to save chat state to localStorage');
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  };
  
  // Clear inactive timeout
  const clearInactiveTimeout = () => {
    if (inactiveTimeout) {
      clearTimeout(inactiveTimeout);
    }
  };
  
  // Track user activity to reset inactive timeout
  const trackActivity = () => {
    if (document.getElementById('fc-chat-widget-container').style.display === 'flex') {
      resetInactiveTimeout();
    }
  };
  
  // Check if widget was previously open
  const restoreChatState = () => {
    try {
      const wasOpen = localStorage.getItem('fc_chat_widget_open') === 'true';
      if (wasOpen) {
        const container = document.getElementById('fc-chat-widget-container');
        if (container) {
          container.style.display = 'flex';
          resetInactiveTimeout();
        }
      }
    } catch (e) {
      console.warn('Unable to restore chat state from localStorage');
    }
  };

  // Initialize function called by the main script
  window.fcChat = function(action, options) {
    if (action === 'init') {
      // Merge default config with user options
      if (options) {
        config = {...config, ...options};
      }
      
      // Initialize widget with a slight delay for better UX
      createStyles();
      
      // Delay showing the widget button to avoid overwhelming visitors
      setTimeout(() => {
        createChatButton();
        createChatContainer();
        
        // Set up activity tracking to reset inactive timeout
        document.addEventListener('mousemove', trackActivity);
        document.addEventListener('keydown', trackActivity);
        document.addEventListener('click', trackActivity);
        
        // Restore previous chat state (if it was open)
        setTimeout(restoreChatState, 500);
      }, 2000); // 2 second delay
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