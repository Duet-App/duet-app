import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonNote, IonPage, IonText, IonTextarea, IonTitle, IonToolbar } from "@ionic/react"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import { useRef } from "react"

const SettingsPage: React.FC = () => {

  const db = new PouchDB('duet')

  const importModal = useRef<HTMLIonModalElement>(null)

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
    db.allDocs({include_docs: true}, (error, doc) => {
      if (error) console.error(error)
      else download(
        JSON.stringify(doc.rows.map(({doc}) => doc)),
        'export.db',
        'application/json'
      )
    })
  }

  const handleImport = ({target: {files: [file]}}) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = ({target: {result}}) => {
        db.bulkDocs(
          JSON.parse(result),
          {new_edits: false}, // not change revision
          (...args) => console.log('DONE', args)
        );
      };
      reader.readAsText(file);
    }
  }  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonListHeader>Import/Export</IonListHeader>
          <IonItem onClick={exportDB}>
            <IonLabel>
              <h2>Export Database</h2>
              <p>Export the database in a JSON format for backing up, or for importing on a different device.</p>
            </IonLabel>
          </IonItem>
          <IonItem id="importDbModal" lines="none">
            <IonLabel>
              <h2>Import Database</h2>
              <p>Import a previously exported Duet database</p>
              {/* <IonNote color="danger">Warning: This action will replace all the tasks, projects and notes on the app. Please make a backup with the Export option if you wish to restore the current data.</IonNote> */}
            </IonLabel>
          </IonItem>
        </IonList>

        <IonModal ref={importModal} trigger="importDbModal">
          <IonContent className="ion-padding">
            <input type="file" onChange={handleImport} />
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default SettingsPage