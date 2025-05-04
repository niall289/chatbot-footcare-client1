# FootCare Clinic Chatbot Integration Guide

This document provides detailed instructions on how to integrate the FootCare Clinic AI Chatbot into your website.

## Integration Options

We offer two methods to integrate the chatbot:

1. **Simple iframe embed** - Easiest to implement but less customizable
2. **JavaScript widget** - Professional solution with more customization options (recommended)

## Option 1: Simple iframe Embed

Add the following HTML code to your website where you want the chatbot to appear:

```html
<!-- FootCare Clinic Chatbot Widget -->
<iframe 
  src="https://your-hosted-chatbot-url.com/chat" 
  style="position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; border: none; z-index: 9999; border-radius: 10px; box-shadow: 0 5px 40px rgba(0,0,0,0.16);" 
  id="footcare-chatbot">
</iframe>
```

Replace `your-hosted-chatbot-url.com` with the actual URL where your chatbot is hosted.

### Customizing the iframe embed

You can adjust the iframe's position, size, and appearance by modifying the style attribute:

- Change `bottom: 20px; right: 20px;` to position the chatbot in a different corner
- Adjust `width: 350px; height: 500px;` to change the size of the chatbot
- Modify `box-shadow` and `border-radius` to change the appearance

## Option 2: JavaScript Widget (Recommended)

### Where to Insert the Code

The code needs to be added to **every page** where you want the chatbot to appear. For most websites, this means adding it to your website's main template file or footer include. 

**Specific placement instructions:**

1. Locate your website's main template file. Common file names include:
   - `footer.php` (for WordPress)
   - `default.html` or `base.html` (for static site generators)
   - Any file that contains the closing `</body>` tag

2. Insert the following code immediately before the closing `</body>` tag:
   ```
   <!-- This is where the chatbot code should go -->
   </body>
   ```

3. For WordPress sites:
   - Go to Appearance > Theme Editor
   - Select your theme's footer.php file
   - Add the code right before the `<?php wp_footer(); ?>` call or the `</body>` tag

4. For Wix/Squarespace sites:
   - Go to Settings > Advanced > Custom Code
   - Add the code in the "Footer" section

The code **must be placed at the end of the page** so it doesn't interfere with your website's loading performance.

```html
<!-- FootCare Clinic Chatbot Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['FootCareWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','fcChat','https://your-hosted-chatbot-url.com/widget.js'));
  fcChat('init', { 
    botName: 'Fiona',
    clinicLocation: 'all', // or 'donnycarney', 'palmerstown', 'baldoyle'
    allowImageUpload: true,
    theme: 'teal', // matches FootCare Clinic branding
    position: 'right' // 'right' or 'left'
  });
</script>
```

Replace `your-hosted-chatbot-url.com` with the actual URL where your chatbot is hosted.

### Widget Configuration Options

The JavaScript widget accepts the following configuration options:

| Option | Default | Description |
|--------|---------|-------------|
| `botName` | 'Fiona' | The name of the chatbot assistant shown in the header |
| `clinicLocation` | 'all' | Pre-selects a specific clinic location. Values: 'all', 'donnycarney', 'palmerstown', 'baldoyle' |
| `allowImageUpload` | true | Whether to allow users to upload foot images for analysis |
| `theme` | 'teal' | Color theme ('teal' matches FootCare Clinic branding) |
| `position` | 'right' | Position of the chat button ('right' or 'left') |

### Page-Specific Configurations

You can customize the chatbot for specific pages of your website. This is ideal for:

1. **Clinic-specific pages**: Set the `clinicLocation` parameter to match the page content
2. **Service-specific pages**: Customize the bot name or theme to match the service

#### How to implement page-specific configurations:

For WordPress or similar CMS:

```php
<!-- FootCare Clinic Chatbot Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['FootCareWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','fcChat','https://your-hosted-chatbot-url.com/widget.js'));
  
  // Get the current page URL to determine configuration
  var currentPage = window.location.pathname;
  
  if (currentPage.includes('/donnycarney')) {
    fcChat('init', { 
      botName: 'Fiona',
      clinicLocation: 'donnycarney',
      allowImageUpload: true,
      theme: 'teal'
    });
  } else if (currentPage.includes('/palmerstown')) {
    fcChat('init', { 
      botName: 'Fiona',
      clinicLocation: 'palmerstown',
      allowImageUpload: true,
      theme: 'teal'
    });
  } else if (currentPage.includes('/baldoyle')) {
    fcChat('init', { 
      botName: 'Fiona',
      clinicLocation: 'baldoyle',
      allowImageUpload: true,
      theme: 'teal'
    });
  } else {
    // Default configuration for all other pages
    fcChat('init', { 
      botName: 'Fiona',
      clinicLocation: 'all',
      allowImageUpload: true,
      theme: 'teal'
    });
  }
</script>
```

This code automatically detects which clinic page the visitor is on and configures the chatbot accordingly.

## FootCare Clinic Website Specific Instructions

Based on our analysis of the FootCare Clinic website (https://www.footcareclinic.ie), here are specific instructions for your website team:

### WordPress Integration Steps

1. **Log in to WordPress admin panel** at https://www.footcareclinic.ie/wp-admin/

2. **Edit your theme's footer.php file**:
   - Go to Appearance > Theme Editor
   - Select "Theme Footer" (footer.php) from the right sidebar
   - Locate the closing `</body>` tag (should be near the bottom of the file)
   - Add the chatbot widget code directly before this tag
   - Click "Update File" to save changes

3. **Alternative method using a plugin** (if you don't have direct theme editing access):
   - Install the "Header and Footer Scripts" plugin from WordPress repository
   - Go to Settings > Header and Footer Scripts
   - Paste the chatbot widget code in the "Scripts in Footer" section
   - Click "Save"

### Cliniko Integration Note

Since your website mentions Cliniko for appointment booking, you can coordinate the chatbot with your Cliniko system by:

1. Adding the patient's details collected by the chatbot to Cliniko via the API
2. Using custom parameters to direct users to the appropriate booking form based on their clinic location preference

```javascript
// Example code to direct to Cliniko booking based on clinic location
if (clinicLocation === 'donnycarney') {
  window.open('https://bookings.cliniko.com/footcareclinic#location=donnycarney', '_blank');
} else if (clinicLocation === 'palmerstown') {
  window.open('https://bookings.cliniko.com/footcareclinic#location=palmerstown', '_blank');
} else if (clinicLocation === 'baldoyle') {
  window.open('https://bookings.cliniko.com/footcareclinic#location=baldoyle', '_blank');
}
```

## Testing the Integration

You can test the chatbot integration locally by accessing the example page:

1. Open your browser and navigate to `http://your-hosted-chatbot-url.com/example-embed.html`
2. The example page shows how the chatbot appears on a sample website
3. Test all functionality to ensure it works as expected

## Troubleshooting

If you encounter any issues with the chatbot integration, check the following:

1. Make sure you're using the correct URL for your hosted chatbot
2. Check browser console for any JavaScript errors
3. Ensure there are no conflicts with other scripts on your website
4. Verify that the chatbot server is running and accessible

## Support

For any questions or support needs, please contact:

- Email: support@footcareclinic.ie
- Phone: (01) 831 1783

## Technical Requirements

The chatbot works on all modern browsers:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Opera 47+

Mobile device compatibility:
- iOS Safari 12+
- Android Chrome 60+

## Hosting Requirements

The chatbot server requires:
- Node.js runtime environment
- PostgreSQL database
- OpenAI API access for image analysis
- WhatsApp Business API for conversation transfer

## Optimal Widget Layout Guidelines

For the best user experience and highest engagement rates, we recommend the following layout guidelines for the chatbot widget:

### Positioning

**Desktop:**
- **Position**: Bottom right corner of the screen
- **Distance from edge**: 20-30px from bottom and right edges
- **Size**: 60px diameter for button, 350-380px width when expanded
- **Z-index**: Set to 9999 to ensure it appears above all other elements

**Mobile:**
- **Position**: Bottom of the screen, centered horizontally
- **Distance from edge**: 15-20px from bottom
- **Size**: 50px diameter for button, 90% width (max 360px) when expanded
- **Z-index**: Set to 9999 to ensure it appears above all other elements

### Visual Appearance

- **Button design**: Circular button with Fiona's avatar
- **Avatar**: Uses "Fiona's" friendly image to create a personal connection
- **Color theme**: Teal background (#00847e) matching the FootCare Clinic branding
- **Contrast ratio**: Ensures text has at least 4.5:1 contrast with background
- **Shadows**: Subtle drop shadow (0 4px 8px rgba(0, 0, 0, 0.2))
- **Animation**: Gentle pulse animation to subtly draw attention
- **Header**: Includes Fiona's avatar image alongside her name

### Behavior

- **Initial state**: Collapsed button showing Fiona's avatar
- **Load delay**: 2-3 seconds after page load to avoid overwhelming visitors
- **Inactive timeout**: Minimize after 5 minutes of inactivity
- **Return visitor**: Remember state between page views (using localStorage)
- **Scroll behavior**: Stay in position during scrolling (fixed position)

### Recommended CSS Customizations

```css
/* Custom styles to optimize widget appearance */
#fc-chat-widget-button {
  /* Subtle pulse animation to draw attention */
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Improve mobile layout */
@media (max-width: 480px) {
  #fc-chat-widget-button {
    bottom: 15px;
    right: calc(50% - 25px); /* Center horizontally */
    width: 50px;
    height: 50px;
  }
  
  #fc-chat-widget-container {
    width: 90%;
    height: 70vh;
    right: 5%;
    left: 5%;
    bottom: 80px;
  }
}
```

These layout guidelines have been tested for optimal visibility and engagement while maintaining a professional appearance that complements the FootCare Clinic website design.

## Data Privacy

The chatbot collects user information including name, email, phone number, and potentially foot images for analysis. This information is stored securely and used only for the purpose of providing podiatry consultations and follow-up care.

All patient data is handled in compliance with GDPR regulations.