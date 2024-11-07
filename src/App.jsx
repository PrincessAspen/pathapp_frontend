import Routes from './routes/Routes'
import AuthProvider from './AuthContext'

function App() {

  return (
    <div>
      <AuthProvider>
        <Routes/>
      </AuthProvider>
    </div>
  );
};

export default App