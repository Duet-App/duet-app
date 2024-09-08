import { IonActionSheet, IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle, IonToolbar, isPlatform, useIonRouter, useIonViewDidEnter, useIonViewWillEnter } from '@ionic/react';
import './Home.css';
import React, { useEffect, useState } from 'react';
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import { addSharp, closeSharp, ellipsisVerticalSharp, helpCircleSharp, informationCircleSharp, settingsSharp } from 'ionicons/icons';
import ReloadPrompt from '../components/ReloadPrompt';
import { App, AppInfo } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import HomeCardsUI from '../components/Home/CardsUI';
import HomeListUI from '../components/Home/ListUI';

const Home: React.FC = () => {

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

  const db = new PouchDB('duet')
  PouchDB.plugin(PouchFind)
  db.createIndex({
    index: {
      fields: ['timestamps.created']
    }
  })
  db.createIndex({
    index: {
      fields: ['scheduled_date']
    }
  })
  db.createIndex({
    index: {
      fields: ['status', 'type', 'project_id']
    }
  })
  db.createIndex({
    index: {
      fields: ['status', 'type', 'scheduled_date']
    }
  })
  db.createIndex({
    index: {
      fields: ['type']
    }
  })
  db.createIndex({
    index: {
      fields: ['timestamps.updated'],
      type: 'json'
    }
  })

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

  setupTagsDDoc()
  setupProjectsDDoc()
  setupProjectsProgressDDoc()
  setupProjectsNotesDDoc()

  const router = useIonRouter()
  const [homeUI, setHomeUI] = useState("list")
  const [appInfo, setAppInfo] = useState<AppInfo>()

  document.addEventListener('ionBackButton', (ev) => {
    ev.detail.register(-1, () => {
      if (!router.canGoBack()) {
        App.exitApp();
      }
    });
  });

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

  return (
    <IonPage>
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
          header={isPlatform('capacitor') && appInfo! ? appInfo.name + ' v' + appInfo.version + '.' + appInfo.build + ' pre-release' : 'Duet v0.9.807 pre-release'}
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
        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton routerLink="/add-task">
            <IonIcon icon={addSharp}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
