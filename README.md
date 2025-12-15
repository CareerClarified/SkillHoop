# SkillHoop (formerly Career Clarified)

A comprehensive career development platform that helps users build professional resumes, analyze their personal brand, and track their career progress using AI-powered tools.

## Tech Stack

- **Frontend Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.4
- **Backend/Database**: Supabase 2.57
- **AI Integration**: OpenAI (GPT-4o-mini)
- **Testing**: Vitest 4.0

## Key Features

### 🤖 AI Resume Building
- Intelligent resume parsing from PDF, DOCX, and TXT files
- AI-powered content suggestions and improvements
- Real-time resume editing with auto-save functionality
- Multiple resume templates and formatting options

### 📄 PDF Parsing
- Extract structured data from uploaded resume files
- Support for multiple file formats (PDF, DOCX, DOC, TXT)
- Automatic text extraction and parsing using pdf.js and mammoth
- Conversion to standardized resume data format

### 🔗 LinkedIn Import
- Import professional data from LinkedIn profiles
- Sync experience, education, and skills
- Brand analysis integration with LinkedIn data

### 🎯 Brand Analysis
- Comprehensive brand scoring across multiple platforms (Resume, LinkedIn, GitHub, Portfolio)
- Personalized recommendations for brand improvement
- Brand archetype identification
- Industry benchmark comparisons

### 📊 Career Tracking
- Job application tracking
- Skill development workflows
- Achievement tracking and sprints
- Portfolio building and publishing

## Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for cloud storage and authentication)
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Career-Clarified
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm test
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests with Vitest

### Project Structure

```
src/
├── components/          # React components
│   ├── resume/        # Resume editor components
│   ├── ui/            # Reusable UI components
│   └── ...
├── context/           # React context providers
│   └── ResumeContext.tsx  # Main resume state management
├── lib/               # Utility libraries
│   ├── resumeParser.ts      # Resume parsing logic
│   ├── brandAnalysisEngine.ts  # Brand analysis engine
│   └── ...
├── pages/             # Page components
└── types/            # TypeScript type definitions
```

## Key Architecture

### Resume Context (`src/context/ResumeContext.tsx`)

The core state management for resume data uses:
- **Debounced Auto-Save**: Automatically saves changes after 500ms of inactivity
- **Ref-based State Management**: Uses refs (`latestStateRef`) to always access the latest state, avoiding stale closure issues
- **Save Queue System**: Prevents concurrent saves with a queue mechanism that ensures all changes are captured
- **Cloud-First Storage**: Attempts Supabase save first, falls back to LocalStorage

### Resume Parser (`src/lib/resumeParser.ts`)

Handles extraction and parsing of resume files:
- Text extraction from PDF (pdf.js), DOCX (mammoth), and TXT files
- AI-powered parsing using OpenAI GPT-4o-mini
- Conversion to standardized ResumeData format

### Brand Analysis Engine (`src/lib/brandAnalysisEngine.ts`)

Comprehensive brand analysis across platforms:
- Rule-based scoring for resume, LinkedIn, GitHub, and portfolio
- AI-generated personalized recommendations
- Brand archetype identification
- Industry benchmark calculations

## Documentation

For detailed documentation on specific features:
- See JSDoc comments in source files for function-level documentation
- Check component files for usage examples
- Review type definitions in `src/types/` for data structures

## Contributing

When contributing to this project:
1. Follow the existing code style and patterns
2. Add JSDoc comments for new functions
3. Update type definitions as needed
4. Write tests for new features
5. Ensure all tests pass before submitting

## License

[Add your license information here]
