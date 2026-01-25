# Beautiful npm Stats

[![CI](https://github.com/srothgan/beautiful-npm-stats/actions/workflows/ci.yml/badge.svg)](https://github.com/srothgan/beautiful-npm-stats/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **Live:** [beautiful-npm-stats.com](https://beautiful-npm-stats.com)

Beautiful npm package statistics. Compare downloads, track trends, and share insights with stunning visualizations.

## Features

- **Package Analytics** - View download statistics, version history, and trends for any npm package
- **Package Comparison** - Compare multiple packages side-by-side with interactive charts
- **Dependency Graph** - Visualize package dependencies with an interactive graph
- **Package Metadata** - View npms.io scores, bundle sizes, TypeScript support, and release cadence
- **GitHub Integration** - See repository stats, stars, and contributor information

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charts and visualizations
- [React Flow](https://reactflow.dev/) - Dependency graph visualization
- [Radix UI](https://radix-ui.com/) - Accessible UI components
- [nuqs](https://nuqs.47ng.com/) - URL state management

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Data Sources

- [npm Registry API](https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md) - Package metadata and downloads
- [npms.io API](https://api-docs.npms.io/) - Package quality scores
- [Bundlephobia API](https://bundlephobia.com/) - Bundle size analysis
- [GitHub API](https://docs.github.com/en/rest) - Repository information

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see [LICENSE](LICENSE) for details.
