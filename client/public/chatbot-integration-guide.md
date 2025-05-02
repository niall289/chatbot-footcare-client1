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

Add the following code to your website, right before the closing `</body>` tag:

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

### Example of clinic-specific configuration

If you want to embed the chatbot specifically for the Palmerstown clinic page:

```javascript
fcChat('init', { 
  botName: 'Fiona',
  clinicLocation: 'palmerstown',
  allowImageUpload: true,
  theme: 'teal'
});
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

## Data Privacy

The chatbot collects user information including name, email, phone number, and potentially foot images for analysis. This information is stored securely and used only for the purpose of providing podiatry consultations and follow-up care.

All patient data is handled in compliance with GDPR regulations.