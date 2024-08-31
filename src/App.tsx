import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, useIonRouter } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Today from './pages/Today';
import Inbox from './pages/Inbox';
import Upcoming from './pages/Upcoming';
import TagsPage from './pages/Tags';
import ProjectsPage from './pages/Projects';
import AddProject from './pages/AddProject';
import AddTask from './pages/AddTask';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './main.css';
import TaskDetails from './pages/TaskDetails';
import ProjectDetailsPage from './pages/ProjectDetails';
import AddProjectTask from './pages/AddProjectTask';
import LogbookPage from './pages/Logbook';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app'
import NotesPage from './pages/Notes';
import AddNote from './pages/AddNote';
import NoteDetails from './pages/NoteDetails';
import SettingsPage from './pages/SettingsPage';
import ReloadPrompt from './components/ReloadPrompt';
import Actionable from './pages/Actionable';

setupIonicReact({
  mode: 'md'
});

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setStatusBarStyleDark()
} else {
  setStatusBarStyleLight()
}

async function setStatusBarStyleDark() {
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({
    color: "#1f1f1f"
  })
};

async function setStatusBarStyleLight() {
  await StatusBar.setStyle({ style: Style.Light });
  await StatusBar.setBackgroundColor({
    color: "#ffffff"
  })
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/today">
          <Today />
        </Route>
        <Route exact path="/actionable">
          <Actionable />
        </Route>
        <Route exact path="/upcoming">
          <Upcoming />
        </Route>
        <Route exact path="/project">
          <ProjectsPage />
        </Route>
        <Route exact path="/project/add">
          <AddProject />
        </Route>
        <Route exact path="/project/details/:id" component={ProjectDetailsPage}/>
        <Route path="/project/add-task/:id">
          <AddTask />
        </Route>
        <Route exact path="/tags">
          <TagsPage />
        </Route>
        <Route path="/tasks/:id" component={TaskDetails}/>
        <Route exact path="/inbox">
          <Inbox />
        </Route>
        <Route exact path="/notes">
          <NotesPage />
        </Route>
        <Route exact path="/notes/add">
          <AddNote />
        </Route>
        <Route path="/notes/details/:id" component={NoteDetails} />
        <Route exact path="/logbook">
          <LogbookPage />
        </Route>
        <Route exact path="/add-task">
          <AddTask />
        </Route>
        <Route exact path="/settings">
          <SettingsPage />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
