import { Capacitor } from "@capacitor/core"
import { Directory, Filesystem } from "@capacitor/filesystem"
import { FilePicker, PickedFile } from "@capawesome/capacitor-file-picker"
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonNote, IonPage, IonSelect, IonSelectOption, IonText, IonTextarea, IonTitle, IonToolbar, SelectChangeEventDetail, isPlatform, useIonToast, useIonViewDidEnter } from "@ionic/react"
// import { AndroidSettings, NativeSettings } from "capacitor-native-settings"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { useRef, useState } from "react"
import StorageAccessFramework from '../plugins/storage-access-framework/index.js';
import { Preferences } from "@capacitor/preferences"
import { IonSelectCustomEvent } from "@ionic/core"

const SettingsPage: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet')
  }

  const importModal = useRef<HTMLIonModalElement>(null)

  const [importFile, setImportFile] = useState<PickedFile>()
  const [noOfProjects, setNoOfProjects] = useState<number>()
  const [noOfTasks, setNoOfTasks] = useState<number>()
  const [noOfNotes, setNoOfNotes] = useState<number>()

  const [homeUIPreference, setHomeUIPreference] = useState("")

  const [present] = useIonToast()

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

  const updateHomeScreenPref = async (e: IonSelectCustomEvent<SelectChangeEventDetail>) => {
    setHomeUIPreference(e.target.value)
    await (setHomeUIPref(e.target.value))
  }

  useIonViewDidEnter(() => {
    async function getSettings() {
      const homeUIPref = await getHomeUIPref()
      setHomeUIPreference(homeUIPref!)
    }
    getSettings()
  })

  function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  const exportDB = () => {
    const timestamp = new Date().toISOString()
    // db.allDocs({include_docs: true}, (error, doc) => {
    //   if (error) console.error(error)
    //   else download(
    //   )
    // })
    db.allDocs({include_docs: true}).then(( async (result) => {
      if(isPlatform('mobileweb' || 'pwa')) {
        download(JSON.stringify(result.rows.map(({doc}) => doc)),
        'duet-' + timestamp + '-db-export.json',
        'application/json')
      } else if(isPlatform('capacitor') && isPlatform('android')) {
        const { uri } = await StorageAccessFramework.saveInFolder({
          filename: 'Duet/duet-' + timestamp + '-db-export.json',
          data: JSON.stringify(result.rows.map(({doc}) => doc))
        });
        console.log("Response from native: ", uri)
        try {
          // await Filesystem.requestPermissions()
          // NativeSettings.openAndroid({
          //   option: AndroidSettings.ApplicationDetails
          // })
          // const folder = await Filesystem.mkdir({
          //   path: 'Duet',
          //   directory: Directory.External
          // })
        } catch (e) {
          // console.log(e)
          // present({
          //   message: 'Permission denied',
          //   duration: 3000
          // })
        }
        // await Filesystem.writeFile({
        //   path: 'Duet/duet-' + timestamp + '-db-export.json',
        //   data: JSON.stringify(result.rows.map(({doc}) => doc)),
        //   directory: Directory.External
        // })
        // present({
        //   message: 'Downloaded to ' + 'duet-' + timestamp + '-db-export.json',
        //   duration: 3000
        // })
      }
    }))
  }

  const handleImport = ({target: {files: [file]}}) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = ({target: {result}}) => {
        db.bulkDocs(
          JSON.parse(result),
          {new_edits: false}, // do not change revision
          (...args) => console.log('DONE', args)
        );
      };
      reader.readAsText(file);
    }
  }

  const pickImportFiles = async () => {
    const perms = await Filesystem.checkPermissions()
    console.log("Permissions", perms)
    const result = await FilePicker.pickFiles({
      types: ['application/json'],
    });
    console.log(result)
    setImportFile(result.files[0])

    let filePath = Capacitor.convertFileSrc(result.files[0].path!)

    fetch(filePath)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = ({target: {result}}) => {
        const data = JSON.parse(result)
        let projectsCount = 0
        let tasksCount = 0
        let notesCount = 0
        data.forEach(item => {
          if(item.type == "project") {
            projectsCount = projectsCount + 1
          }
          if(item.type == 'task') {
            tasksCount = tasksCount + 1
          }
          if(item.type == 'note') {
            notesCount = notesCount + 1
          }
        })
        setNoOfProjects(projectsCount)
        setNoOfTasks(tasksCount)
        setNoOfNotes(notesCount)
      };
      reader.readAsText(blob);
    })

  };

  const importDB = async () => {
    let filePath = Capacitor.convertFileSrc(importFile?.path!)

    fetch(filePath)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = ({target: {result}}) => {
        db.bulkDocs(
          JSON.parse(result),
          {new_edits: JSON.parse(result).find(r => r._rev) ? false : true}, // do not change revision
        ).then(response => {
          present({
            message: 'Successfully imported',
            duration: 3000
          })
          importModal.current?.dismiss()
        })
      };
      reader.readAsText(blob);
    })
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonListHeader>User Interface</IonListHeader>
          <IonItem button>
            <IonSelect value={homeUIPreference} interface="popover" label="Homescreen Interface" onIonChange={(e) => {updateHomeScreenPref(e)}}>
              <IonSelectOption value="list">List</IonSelectOption>
              <IonSelectOption value="cards">Cards</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader>Import/Export</IonListHeader>
          <IonItem onClick={exportDB} button>
            <IonLabel>
              <h2>Export Database</h2>
              <p>Export the database in a JSON format for backing up, or for importing on a different device.</p>
            </IonLabel>
          </IonItem>
          <IonItem id="importDbModal" lines="none" button>
            <IonLabel>
              <h2>Import Database</h2>
              <p>Import a previously exported Duet database</p>
              {/* <IonNote color="danger">Warning: This action will replace all the tasks, projects and notes on the app. Please make a backup with the Export option if you wish to restore the current data.</IonNote> */}
            </IonLabel>
          </IonItem>
        </IonList>

        <IonModal ref={importModal} trigger="importDbModal">
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonButtons slot='start'>
                <IonBackButton defaultHref="/" />
              </IonButtons>
              <IonTitle>Import file</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <p style={{marginBottom: '16px'}}>Import your previously backed up database. Press the button below to pick the file from your device to import it.</p>
            {
              isPlatform('android')
              ? <>
                <IonButton expand="block" onClick={pickImportFiles}>Pick file</IonButton>
                {
                  importFile && <>
                    <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column'}}>
                      <IonText style={{width: '100%'}} color="medium">Filename: {importFile.name}</IonText>
                      <IonText color="medium">Last modified: {new Date(importFile.modifiedAt!).toLocaleString()}</IonText>
                      {
                        noOfProjects || noOfTasks || noOfNotes
                        ? <>
                          <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column'}}>
                            <h4>DB Details:</h4>
                            <IonText color="medium">Tasks: {noOfTasks}</IonText>
                            <IonText color="medium">Projects: {noOfProjects}</IonText>
                            <IonText color="medium">Notes: {noOfNotes}</IonText>
                            <p>Would you like to import this database?</p>
                            <IonButton expand="block" onClick={importDB}>Import</IonButton>
                          </div>
                        </>
                        : null
                      }
                    </div>
                  </>
                }
              </>
              : <input type="file" onChange={handleImport} />
            }
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default SettingsPage