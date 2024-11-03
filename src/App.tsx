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
import useScreenSize from './hooks/useScreenSize';

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
import NotesFolderPage from './pages/NotesFolder';
import Waiting from './pages/Waiting';
import ThreePaneUI from './components/ThreePaneUI';

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

const App: React.FC = () => {

  const screenSize = useScreenSize()

  return (
    <IonApp>
      <IonReactRouter>
        {
          screenSize.width > 992
          ? <ThreePaneUI />
          :
          <IonRouterOutlet>
            {/* <Route exact path="/home" component={Home}>
            </Route> */}
            <Route exact path="/" component={Home}>
            </Route>
            <Route exact path="/today" component={Today} />
            <Route exact path="/actionable" component={Actionable} />
            <Route exact path="/upcoming" component={Upcoming} />
            <Route exact path="/waiting" component={Waiting} />
            {/* <Route exact path="/project">
              <ProjectsPage />
            </Route> */}
            <Route path="/project" render={() => <ProjectsPage />} />
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
            <Route exact path="/inbox" component={Inbox} />
            <Route exact path="/inbox/:id" component={TaskDetails} />
            <Route exact path="/actionable/:id" component={TaskDetails} />
            <Route exact path="/waiting/:id" component={TaskDetails} />
            <Route exact path="/upcoming/:id" component={TaskDetails} />
            <Route exact path="/today/:id" component={TaskDetails} />
            <Route exact path="/notes">
              <NotesPage />
            </Route>
            <Route exact path="/notes/add" component={AddNote} />
            <Route exact path="/notes/add/:id" component={AddNote} />
            <Route path="/notes/details/:id" component={NoteDetails} />
            <Route path="/notes/folder/:path" component={NotesFolderPage} />
            <Route exact path="/logbook">
              <LogbookPage />
            </Route>
            <Route exact path="/add-task">
              <AddTask />
            </Route>
            <Route exact path="/settings">
              <SettingsPage />
            </Route>
            {/* <Route exact path="/">
              <Redirect to="/home" />
            </Route> */}
          </IonRouterOutlet>
        }
      </IonReactRouter>
    </IonApp>
  )
}

export default App;
