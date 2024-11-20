import './index.css';
import Routes from './routes/Routes'
import AuthProvider from './AuthContext'
import CharacterProvider from './CharacterContext'

function App() {

  return (
    <div className="h-full">
      {/* Applying tailwind classes to ensure the background and full height */}
      <AuthProvider>
        <CharacterProvider>
          <Routes />
        </CharacterProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
