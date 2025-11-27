# Debug Challenge - Quick Notes App

## 🐛 About This Project

This is a **simple note-taking app** intentionally broken with 5 bugs for a debugging challenge.

## 🚀 Setup

```bash
npm install
npm run dev
```

Then open in your browser at `http://localhost:5173`

## 📱 Testing on Mobile (Optional with Capacitor)

If you want to test the mobile bugs:

```bash
npm install -g @capacitor/cli
npx cap init
npx cap add ios    # or android
npx cap sync
npx cap open ios   # or android
```

## ⚠️ Known Issues

This app has **5 bugs** that you need to find and fix:

1. **Performance Issue** - Something re-renders too much
2. **TypeScript Error** - Type mismatch causing runtime errors
3. **UI Bug** - Display issues on mobile
4. **State Management Bug** - Wrong item gets deleted
5. **Storage Bug** - Notes don't persist

## 📝 Your Task

Find and fix all 5 bugs, then explain your solutions in a SOLUTION.md file.

Good luck! 🍀
