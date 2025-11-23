module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#5B21B6' },
        accent: '#8B5CF6',
        bg: '#F8FAFC'
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        times: ['"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: { 'soft-lg': '0 10px 30px rgba(15,23,42,0.06)' },
      keyframes: {
        pulseValue: { '0%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.06)', opacity: '.95' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        floatUp: { '0%': { transform: 'translateY(8px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } }
      },
      animation: { pulseValue: 'pulseValue 450ms ease', floatUp: 'floatUp 400ms ease' }
    }
  },
  plugins: [],
}
