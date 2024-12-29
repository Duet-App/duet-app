import { IonActionSheet, IonBackdrop, IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonGrid, IonHeader, IonIcon, IonPage, IonRouterOutlet, IonRow, IonSplitPane, IonText, IonTitle, IonToolbar, isPlatform, useIonRouter, useIonToast, useIonViewDidEnter, useIonViewWillEnter } from '@ionic/react';
import './Home.css';
import React, { useEffect, useRef, useState } from 'react';
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import CordovaSqlite from 'pouchdb-adapter-cordova-sqlite'
import { addSharp, closeSharp, documentTextSharp, ellipsisVerticalSharp, fileTraySharp, helpCircleSharp, informationCircleSharp, settingsSharp } from 'ionicons/icons';
import ReloadPrompt from '../components/ReloadPrompt';
import { App, AppInfo } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import HomeCardsUI from '../components/Home/CardsUI';
import HomeListUI from '../components/Home/ListUI';
import "./fab.css"
import Inbox from './Inbox';
import { Redirect, Route } from 'react-router';
import Today from './Today';
import HomeTwoPane from '../components/Home/HomeTwoPane';
import TaskDetails from './TaskDetails';
import useScreenSize from '../hooks/useScreenSize';
import Actionable from './Actionable';
import Waiting from './Waiting';
import Upcoming from './Upcoming';
import AddTask from './AddTask';
import AddNote from './AddNote';
import NoteDetails from './NoteDetails';
import ProjectsPage from './Projects';

const Home: React.FC = () => {

  const [present] = useIonToast();

  const getHomeUIPref = async () => {
    const { value } = await Preferences.get({ key: 'homeUI' })
    return value;
  }

  const setHomeUIPref = async (homeUISetting: string) => {
    await Preferences.set({
      key: 'homeUI',
      value: homeUISetting
    })
  }
  
  const getDbMigratedToSqlitePref = async () => {
    const { value } = await Preferences.get({ key: 'dbMigratedToSqlite' })
    return value
  }

  const setDbMigratedToSqlitePref = async (dbMigratedToSqlite: boolean) => {
    await Preferences.set({
      key: 'dbMigratedToSqlite',
      value: String(dbMigratedToSqlite)
    })
  }

  let db: PouchDB.Database

  if(isPlatform('capacitor')) {
    document.addEventListener('deviceready', async function () {
      PouchDB.plugin(CordovaSqlite)

      db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
      let isDbMigrated: string|null = await getDbMigratedToSqlitePref()
      if(isDbMigrated == null) {
        await setDbMigratedToSqlitePref(false)
        isDbMigrated = await getDbMigratedToSqlitePref()
      }

      if(isDbMigrated == "false") {
        const indexedDbDb = new PouchDB('duet')

        indexedDbDb.replicate.to(db).then(async (result) => {
          if(result.ok) {
            present({
              message: "Migrated DB",
              duration: 1500,
              position: 'bottom'
            })
            await setDbMigratedToSqlitePref(true)
          }
        }).catch(e => {
          console.log("Failed to migrate DB", e)
          present({
            message: "Failed to migrate DB",
            duration: 5000,
            position: 'bottom'
          })
        })
      }
    })
  } else {
    db = new PouchDB('duet')
  }
  PouchDB.plugin(PouchFind)

  const setupIndexes = async () => {
    await db.createIndex({
      index: {
        fields: ['timestamps.created']
      }
    })
    await db.createIndex({
      index: {
        fields: ['scheduled_date']
      }
    })
    await db.createIndex({
      index: {
        fields: ['status', 'type', 'project_id']
      }
    })
    await db.createIndex({
      index: {
        fields: ['status', 'type', 'scheduled_date']
      }
    })
    await db.createIndex({
      index: {
        fields: ['type']
      }
    })
    await db.createIndex({
      index: {
        fields: ['timestamps.updated'],
        type: 'json'
      }
    })
    await setupTagsDDoc()
    await setupProjectsDDoc()
    await setupProjectsProgressDDoc()
    await setupProjectsNotesDDoc()
  }

  setupIndexes()

  const tags_ddoc = {
    "_id": "_design/tags-ddoc",
    views: {
      "all-tags": {
        map: function mapFun(doc) {
          if(doc.tags && doc.tags.length > 0) {
            for(var idx in doc.tags) {
              emit(doc.tags[idx], null);
            }
          }
        }.toString(),
        reduce: function redFun(keys, values) {
          return keys;
        }.toString()
      }
    }
  }

  const projects_ddoc = {
    "_id": "_design/projects-ddoc",
    views: {
      "project-tasks": {
        map: function mapFun(doc) {
          if(doc.type == "project" && doc.tasks) {
            for(var i in doc.tasks) {
              emit([doc._id, Number(i)+1], {_id: doc.tasks[i]})
            }
          }
        }.toString()
      },
      "project-notes": {
        map: function mapFun(doc) {
          if(doc.type == "project" && doc.notes) {
            for(var i in doc.notes) {
              emit([doc._id, Number(i)+1], {_id: doc.notes[i]})
            }
          }
        }.toString()
      },
      "project-progress": {
        map: function mapFun(doc) {
          if(doc.type == "task" && doc.project_id) {
            emit(doc.project_id, {type: "task", status: doc.status});
          }
        }.toString(),
        reduce: function redFun(keys, values, rereduce) {
          if (rereduce) {
            return values;
          } else {
            var total = 0;
            var complete = 0;
            for(var i = 0; i < values.length; i++) {
              if(values[i].type == "task") {
                if(values[i].status == "Done" || values[i].status == "Cancelled") {
                  complete = complete + 1;
                }
                total = total + 1;
              }
            }
            return {total: total, complete: complete};
          }
        }.toString()
      }
    }
  }

  const projects_progress_ddoc = {
    "_id": "_design/projects-progress-ddoc",
    views: {
      "project-progress": {
        map: function mapFun(doc) {
          if(doc.type == "task" && doc.project_id) {
            emit(doc.project_id, {type: "task", status: doc.status});
          }
        }.toString(),
        reduce: function redFun(keys, values, rereduce) {
          if (rereduce) {
            return values;
          } else {
            var total = 0;
            var complete = 0;
            for(var i = 0; i < values.length; i++) {
              if(values[i].type == "task") {
                if(values[i].status == "Done" || values[i].status == "Cancelled") {
                  complete = complete + 1;
                }
                total = total + 1;
              }
            }
            return {total: total, complete: complete};
          }
        }.toString()
      }
    }
  }

  const projects_notes_ddoc = {
    "_id": "_design/projects-notes-ddoc",
    views: {
      "project-notes": {
        map: function mapFun(doc) {
          if(doc.type == "project" && doc.notes) {
            for(var i in doc.notes) {
              emit([doc._id, Number(i)+1], {_id: doc.notes[i]})
            }
          }
        }.toString()
      },
    }
  }

  const setupTagsDDoc = async () => {
    try {
      await db.put(tags_ddoc);
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  const setupProjectsDDoc = async () => {
    let current_projects_ddoc_rev
    db.get("_design/projects-ddoc").then((response) => {
      current_projects_ddoc_rev = response._rev
    })
    try {
      await db.put({
        ...projects_ddoc,
        _rev: current_projects_ddoc_rev
      });
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  const setupProjectsProgressDDoc = async () => {
    try {
      await db.put(projects_progress_ddoc);
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  const setupProjectsNotesDDoc = async () => {
    try {
      await db.put(projects_notes_ddoc);
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  const router = useIonRouter()
  const [homeUI, setHomeUI] = useState("list")
  const [appInfo, setAppInfo] = useState<AppInfo>()
  const fabRef = useRef<HTMLIonFabElement>(null)
  const [overlayVisible, setOverlayVisible] = useState(false)

  const screenSize = useScreenSize()

  if(isPlatform('android')) {
    document.addEventListener('ionBackButton', (ev) => {
      ev.detail.register(-1, () => {
        if (!router.canGoBack()) {
          App.exitApp();
        }
      });
    });
  }

  useIonViewWillEnter(() => {
    async function getHomeUI() {
      setAppInfo(await App.getInfo())
      const pref = await getHomeUIPref()
      if(pref == null) {
        await setHomeUIPref("list")
        setHomeUI("list")
        return
      }
      setHomeUI(pref!)
    }
    getHomeUI()
  }, [])

  console.log(router.routeInfo.pathname.split("/").at(-1))

  const isHomeURL = () => {
    if(router.routeInfo.pathname.split("/").at(-1) === ""
    || router.routeInfo.pathname.split("/").at(-1) === "inbox"
    || router.routeInfo.pathname.split("/").at(-1) === "today"
    || router.routeInfo.pathname.split("/").at(-1) === "actionable"
    || router.routeInfo.pathname.split("/").at(-1) === "upcoming"
    || router.routeInfo.pathname.split("/").at(-1) === "waiting"
    || (router.routeInfo.pathname.split("/").at(-2) === "notes" && router.routeInfo.pathname.split("/").at(-1) === "add")
    || (router.routeInfo.pathname.split("/").at(-3) === "notes" && router.routeInfo.pathname.split("/").at(-2) === "details")
    || router.routeInfo.pathname.split("/").at(-1) === "add-task") {
      return true
    } else {
      return false
    }
  }

  const isUUIDURL = () => {
    if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(router.routeInfo.pathname.split("/").at(-1)!)) {
      return true
    } else {
      return false
    }
  }

  if(screenSize.width > 992) {
    return (
      <>
        <div style={{width: '33vw'}}>
          <IonPage style={{width: '33vw', borderRight: '1px solid rgba(var(--ion-color-medium-rgb), 0.1)'}}>
            <IonBackdrop
              visible={overlayVisible}
              style={{opacity: 0.15, zIndex: overlayVisible ? 11 : -1, transition: 'opacity,background 0.25s ease-in-out'}}
            ></IonBackdrop>
            <IonHeader className='ion-no-border'>
              <IonToolbar>
                <IonTitle>Duet</IonTitle>
                <IonButtons slot='end'>
                  <IonButton id='openActionsSheet'>
                    <IonIcon slot='icon-only' icon={ellipsisVerticalSharp} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
              {
                (homeUI == 'list')
                ? <HomeListUI />
                : <HomeCardsUI />
              }
              <IonActionSheet
                trigger='openActionsSheet'
                header={isPlatform('capacitor') && appInfo! ? appInfo.name + ' v' + appInfo.version + '.' + appInfo.build + ' pre-release' : 'Duet v0.9.813 pre-release'}
                buttons={[
                  {
                    text: 'Settings',
                    icon: settingsSharp,
                    data: {
                      action: 'openSettings'
                    }
                  },
                  {
                    text: 'Help',
                    icon: helpCircleSharp,
                    data: {
                    }
                  },
                  {
                    text: 'About',
                    icon: informationCircleSharp,
                    data: {
                    }
                  },
                ]}
                onDidDismiss={({detail}) => {
                  if(detail.data?.action == 'openSettings') {
                    router.push('/settings')
                  }
                }}
              ></IonActionSheet>
              <ReloadPrompt />
              <IonFab ref={fabRef} onClick={() => {fabRef.current?.activated ? setOverlayVisible(true) : setOverlayVisible(false)}} slot='fixed' vertical='bottom' horizontal='end'>
                <IonFabButton>
                  <IonIcon icon={addSharp}></IonIcon>
                </IonFabButton>
                <IonFabList side='top'>
                  <IonFabButton routerLink="/add-task" data-title="Add to Inbox">
                    <IonIcon icon={fileTraySharp}></IonIcon>
                  </IonFabButton>
                  <IonFabButton routerLink="/notes/add" data-title="Add note">
                    <IonIcon icon={documentTextSharp}></IonIcon>
                  </IonFabButton>
                </IonFabList>
              </IonFab>
            </IonContent>
          </IonPage>
        </div>
        {
          router.routeInfo.pathname.split("/").at(-1) !== ""
          ?
          <IonRouterOutlet style={{width: isHomeURL() ? '67vw' : '33vw', marginLeft: '33vw', borderRight: isHomeURL() ? 'none' : '1px solid rgba(var(--ion-color-medium-rgb), 0.1)'}}>
            <Route path="/inbox" component={Inbox} />
            <Route path="/today" component={Today} />
            <Route path="/actionable" component={Actionable} />
            <Route path="/waiting" component={Waiting} />
            <Route path="/upcoming" component={Upcoming} />
            <Route path="/add-task" component={AddTask} />
            <Route path="/project" component={ProjectsPage} />
            <Route path="/notes/add" component={AddNote} />
            <Route path="/notes/details/:id" component={NoteDetails} />
          </IonRouterOutlet>
          : null
        }
        {
          isUUIDURL()
          ?
          <IonRouterOutlet style={{width: '34vw', marginLeft: '66vw', borderRight: '1px solid rgba(var(--ion-color-medium-rgb), 0.1)'}}>
            <Route path="/inbox/:id" component={TaskDetails} />
            <Route path="/today/:id" component={TaskDetails} />
            <Route path="/actionable/:id" component={TaskDetails} />
            <Route path="/waiting/:id" component={TaskDetails} />
            <Route path="/upcoming/:id" component={TaskDetails} />
          </IonRouterOutlet>
          : null
        }
      </>
    );
  } else {
    return (
      <IonPage>
        <IonBackdrop
          visible={overlayVisible}
          style={{opacity: 0.15, zIndex: overlayVisible ? 11 : -1, transition: 'opacity,background 0.25s ease-in-out'}}
        ></IonBackdrop>
        <IonHeader className='ion-no-border'>
          <IonToolbar>
            <IonTitle>Duet</IonTitle>
            <IonButtons slot='end'>
              <IonButton id='openActionsSheet'>
                <IonIcon slot='icon-only' icon={ellipsisVerticalSharp} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          {
            (homeUI == 'list')
            ? <HomeListUI />
            : <HomeCardsUI />
          }
          <IonActionSheet
            trigger='openActionsSheet'
            header={isPlatform('capacitor') && appInfo! ? appInfo.name + ' v' + appInfo.version + '.' + appInfo.build + ' pre-release' : 'Duet v0.9.813 pre-release'}
            buttons={[
              {
                text: 'Settings',
                icon: settingsSharp,
                data: {
                  action: 'openSettings'
                }
              },
              {
                text: 'Help',
                icon: helpCircleSharp,
                data: {
                }
              },
              {
                text: 'About',
                icon: informationCircleSharp,
                data: {
                }
              },
            ]}
            onDidDismiss={({detail}) => {
              if(detail.data?.action == 'openSettings') {
                router.push('/settings')
              }
            }}
          ></IonActionSheet>
          <ReloadPrompt />
          <IonFab ref={fabRef} onClick={() => {fabRef.current?.activated ? setOverlayVisible(true) : setOverlayVisible(false)}} slot='fixed' vertical='bottom' horizontal='end'>
            <IonFabButton>
              <IonIcon icon={addSharp}></IonIcon>
            </IonFabButton>
            <IonFabList side='top'>
              <IonFabButton routerLink="/add-task" data-title="Add to Inbox">
                <IonIcon icon={fileTraySharp}></IonIcon>
              </IonFabButton>
              <IonFabButton routerLink="/notes/add" data-title="Add note">
                <IonIcon icon={documentTextSharp}></IonIcon>
              </IonFabButton>
            </IonFabList>
          </IonFab>
        </IonContent>
      </IonPage>
    );
  }
};

export default Home;
