# 3Gs iRacing Overlays

Comprehensive overlay development framework for iRacing with complete OAuth integration and Data API support.

## Overview

This repository provides a complete knowledge base and code examples for building iRacing overlays. It includes comprehensive documentation about the iRacing Data API, OAuth authentication flow, and best practices for overlay development.

## Features

- ✅ **Complete OAuth 2.0 Implementation** - Full authentication flow with token management
- ✅ **Data API Integration** - Access to all iRacing Data API endpoints
- ✅ **Example Overlays** - Working examples with live data display
- ✅ **VS Code Copilot Integration** - Rich documentation for AI-assisted development
- ✅ **Best Practices Guide** - Security, performance, and design patterns
- ✅ **TypeScript Support** - Type-safe development examples

## Quick Start

### Prerequisites

- iRacing account with API access
- Node.js 14+ (for examples)
- VS Code with GitHub Copilot (recommended)

### Documentation

This repository contains comprehensive documentation to help you build iRacing overlays:

- **[GitHub Copilot Instructions](.github/copilot-instructions.md)** - Complete guide for AI-assisted development
- **[OAuth Flow Documentation](docs/iracing-oauth-flow.md)** - Authentication implementation guide
- **[Data API Reference](docs/iracing-data-api.md)** - All API endpoints and usage patterns
- **[Overlay Development Guide](docs/overlay-development-guide.md)** - Best practices and patterns
- **[API Reference](docs/api-reference.md)** - Quick reference for all endpoints

### Example Code

Check the [examples](examples/) directory for working implementations:

- **[auth-manager.js](examples/auth-manager.js)** - OAuth authentication manager
- **[data-client.js](examples/data-client.js)** - Complete API client
- **[simple-overlay.html](examples/simple-overlay.html)** - HTML overlay with live updates

### Getting Started

1. **Clone this repository:**
   ```bash
   git clone https://github.com/cfranz73/3Gs-iRacing-Overlays.git
   cd 3Gs-iRacing-Overlays
   ```

2. **Read the documentation:**
   Start with [.github/copilot-instructions.md](.github/copilot-instructions.md) for a complete overview.

3. **Explore the examples:**
   ```bash
   cd examples
   # Open simple-overlay.html in browser
   # Or run Node.js examples
   node auth-manager.js
   ```

4. **Set up your credentials:**
   Create a `.env` file (never commit this):
   ```bash
   IRACING_CLIENT_ID=your-client-id
   IRACING_EMAIL=your-email@example.com
   IRACING_PASSWORD=your-password
   ```

## Documentation Structure

```
📁 .github/
  └── copilot-instructions.md    # Main Copilot knowledge base
📁 docs/
  ├── iracing-oauth-flow.md      # OAuth authentication guide
  ├── iracing-data-api.md        # Data API documentation
  ├── overlay-development-guide.md # Development best practices
  └── api-reference.md           # Quick API reference
📁 examples/
  ├── auth-manager.js            # Authentication implementation
  ├── data-client.js             # API client implementation
  ├── simple-overlay.html        # Complete overlay example
  └── README.md                  # Example documentation
📁 .vscode/
  └── settings.json              # VS Code configuration
```

## Key Topics Covered

### Authentication & Security
- OAuth 2.0 password credentials flow
- Token management and refresh
- Secure credential storage
- Error handling and retry logic

### Data API Integration
- All API endpoints documented
- Request caching strategies
- Rate limit handling
- Pagination patterns

### Overlay Development
- Component architecture
- Real-time data updates
- State management
- Performance optimization
- UI/UX best practices

### Examples & Patterns
- Complete working implementations
- TypeScript type definitions
- Error handling patterns
- Testing strategies

## VS Code Copilot Integration

This repository is optimized for use with GitHub Copilot:

1. Open this repository in VS Code
2. GitHub Copilot will automatically read `.github/copilot-instructions.md`
3. Start coding - Copilot will provide context-aware suggestions
4. Ask Copilot questions about iRacing API integration

## Common Use Cases

### Building a Position Overlay
```javascript
const client = new iRacingDataClient(auth);
const races = await client.getRecentRaces();
displayPosition(races[0].finish_position);
```

### Displaying Lap Times
```javascript
const lapData = await client.getLapData(subsessionId);
lapData.laps.forEach(lap => {
  console.log(`Lap ${lap.lap_number}: ${formatLapTime(lap.lap_time)}`);
});
```

### Real-time Updates
```javascript
setInterval(async () => {
  const data = await fetchCurrentSession();
  updateOverlay(data);
}, 1000);
```

## Best Practices

- **Security**: Never commit credentials, use environment variables
- **Caching**: Cache static data (cars, tracks) for better performance
- **Rate Limits**: Respect API rate limits with proper throttling
- **Error Handling**: Implement comprehensive error handling and retry logic
- **Token Management**: Proactively refresh tokens before expiration
- **Performance**: Optimize update loops and minimize DOM updates

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:

- Bug fixes
- Documentation improvements
- New examples
- Feature requests

## Resources

- [iRacing Website](https://www.iracing.com)
- [iRacing Forums](https://forums.iracing.com)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- Community overlay projects on GitHub

## License

See [LICENSE](LICENSE) file for details.

## Support

For questions or issues:
- Check the [documentation](docs/)
- Review [examples](examples/)
- Open an [issue](https://github.com/cfranz73/3Gs-iRacing-Overlays/issues)
- Visit iRacing developer forums

## Acknowledgments

Built for the iRacing community to facilitate overlay development and API integration.

---

**Note**: This repository provides documentation and examples. You'll need valid iRacing API credentials to use the Data API. Never share your credentials or commit them to version control.
# 3Gs-iRacing-Overlays
Overlays for iRacing Sim

## 🤖 AI-Powered Development

This repository is optimized for AI-assisted development! Check out our [AI Prompt Template](.github/PROMPT_TEMPLATE.md) for guidance on using AI tools effectively with this project.

### Quick Start with AI Tools

- **GitHub Copilot**: This repository includes templates to help Copilot understand the iRacing overlay context
- **Perplexity AI**: Use our prompt templates for targeted research on iRacing APIs and overlay development
- **ChatGPT/Claude**: Get better responses by using our structured prompt templates

See [`.github/PROMPT_TEMPLATE.md`](.github/PROMPT_TEMPLATE.md) for ready-to-use prompt templates covering:
- Code development and debugging
- iRacing API integration
- Feature planning
- Research and best practices

## About

This project provides overlays for the iRacing racing simulator, enabling streamers and racers to display real-time racing data and information.
