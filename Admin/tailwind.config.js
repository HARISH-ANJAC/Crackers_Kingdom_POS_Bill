/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          light: '#818CF8', // Indigo 400
          dark: '#3730A3', // Indigo 800
        },
        secondary: {
          DEFAULT: '#EC4899', // Pink 600
          light: '#F472B6', // Pink 400
          dark: '#BE185D', // Pink 700
        },
        background: {
          light: '#F9FAFB', // Gray 50
          dark: '#111827', // Gray 900
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937', // Gray 800
        },
        text: {
          primary: '#1F2937', // Gray 800
          secondary: '#6B7280', // Gray 500
          light: '#F3F4F6', // Gray 100
        },
        error: '#EF4444',
        success: '#10B981',
      },
      spacing: {
        '128': '32rem',
      },
      screens: {
        xs: '320px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}

