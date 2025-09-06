# WordPress Embedding Instructions for EZWAI AI Survey

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL=gpt-4o-mini`
   - `OPENAI_MODEL_REPORT=gpt-5`
   - `GHL_TOKEN`
   - `GHL_LOCATION_ID`
4. Deploy and get your production URL (e.g., `https://your-app.vercel.app`)

### Option 2: Self-Host
1. Build the production app: `npm run build`
2. Start the production server: `npm run start`
3. Use a process manager like PM2 to keep it running
4. Set up a reverse proxy with nginx/Apache to serve it

## WordPress Embedding Code

### Method 1: Simple iframe (Add to WordPress Page/Post)

```html
<div id="ezwai-survey-container" style="width: 100%; min-height: 800px;">
  <iframe 
    id="ezwai-survey-frame"
    src="https://your-deployed-url.vercel.app/embed"
    style="width: 100%; border: none; min-height: 800px;"
    allow="clipboard-write"
    loading="lazy">
  </iframe>
</div>

<script>
// Auto-resize iframe based on content
window.addEventListener('message', function(e) {
  if (e.data.type === 'EZWAI_IFRAME_HEIGHT') {
    const iframe = document.getElementById('ezwai-survey-frame');
    if (iframe) {
      iframe.style.height = e.data.height + 'px';
    }
  }
});
</script>
```

### Method 2: WordPress Shortcode (Add to functions.php)

```php
// Add this to your WordPress theme's functions.php
function ezwai_survey_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '800',
        'url' => 'https://your-deployed-url.vercel.app/embed'
    ), $atts);
    
    $html = '<div id="ezwai-survey-container" style="width: 100%; min-height: ' . esc_attr($atts['height']) . 'px;">';
    $html .= '<iframe ';
    $html .= 'id="ezwai-survey-frame" ';
    $html .= 'src="' . esc_url($atts['url']) . '" ';
    $html .= 'style="width: 100%; border: none; min-height: ' . esc_attr($atts['height']) . 'px;" ';
    $html .= 'allow="clipboard-write" ';
    $html .= 'loading="lazy">';
    $html .= '</iframe>';
    $html .= '</div>';
    $html .= '<script>';
    $html .= 'window.addEventListener("message", function(e) {';
    $html .= '  if (e.data.type === "EZWAI_IFRAME_HEIGHT") {';
    $html .= '    const iframe = document.getElementById("ezwai-survey-frame");';
    $html .= '    if (iframe) iframe.style.height = e.data.height + "px";';
    $html .= '  }';
    $html .= '});';
    $html .= '</script>';
    
    return $html;
}
add_shortcode('ezwai_survey', 'ezwai_survey_shortcode');
```

Then use in any page/post:
```
[ezwai_survey height="800" url="https://your-deployed-url.vercel.app/embed"]
```

### Method 3: WordPress Custom Page Template

Create a new page template file (e.g., `template-ai-survey.php`):

```php
<?php
/*
Template Name: AI Survey Page
*/
get_header(); 
?>

<div class="ai-survey-wrapper" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    <h1><?php the_title(); ?></h1>
    
    <div id="ezwai-survey-container" style="width: 100%; min-height: 800px; background: #f5f5f5; border-radius: 8px; overflow: hidden;">
        <iframe 
            id="ezwai-survey-frame"
            src="https://your-deployed-url.vercel.app/embed"
            style="width: 100%; border: none; min-height: 800px;"
            allow="clipboard-write"
            loading="lazy">
        </iframe>
    </div>
</div>

<script>
// Auto-resize iframe
window.addEventListener('message', function(e) {
    if (e.data.type === 'EZWAI_IFRAME_HEIGHT') {
        const iframe = document.getElementById('ezwai-survey-frame');
        if (iframe) {
            iframe.style.height = e.data.height + 'px';
        }
    }
});
</script>

<?php get_footer(); ?>
```

## Styling the Container (Optional)

Add to your WordPress theme's CSS:

```css
/* AI Survey Container Styling */
#ezwai-survey-container {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    margin: 20px 0;
}

#ezwai-survey-frame {
    transition: height 0.3s ease;
}

/* Loading state */
#ezwai-survey-container:empty::before {
    content: "Loading AI Survey...";
    display: block;
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
    #ezwai-survey-container {
        min-height: 600px !important;
    }
}
```

## Important Notes

1. **HTTPS Required**: Your WordPress site must use HTTPS for the iframe to work properly
2. **CSP Headers**: The app is configured to allow embedding on `https://ezwai.com` and its subdomains
3. **Auto-Resize**: The iframe automatically adjusts height based on content
4. **Mobile Responsive**: The survey is fully responsive and works on all devices
5. **Data Security**: All API keys are server-side only, never exposed to the client

## Testing Locally

To test the iframe locally with WordPress:
1. Run the Next.js dev server: `npm run dev`
2. Use `http://localhost:3000/embed` as the iframe source
3. The CSP headers allow localhost for testing

## Troubleshooting

### Iframe not showing?
- Check browser console for CSP errors
- Ensure the URL is correct and the app is running
- Verify HTTPS is enabled on your WordPress site

### Form not submitting?
- Check that environment variables are set correctly
- Verify API keys are valid
- Check browser console for errors

### Styling issues?
- The iframe inherits some styles from the parent page
- Use the container styling above to isolate the iframe
- Test on different devices and browsers

## Support

For issues or questions, check:
- Browser Developer Console for errors
- Network tab for failed API calls
- Vercel/hosting logs for server errors