import './index.css';
import Routes from './routes/Routes'
import AuthProvider from './AuthContext'
import CharacterProvider from './CharacterContext'

function App() {

  return (
    <div>
      <AuthProvider>
        <CharacterProvider>
          <Routes/>
        </CharacterProvider>
      </AuthProvider>
    </div>
  );
};

export default App