import { IonAvatar, IonBackButton, IonBreadcrumb, IonBreadcrumbs, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { add, documentTextSharp, folderSharp } from "ionicons/icons"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useState } from "react"
import NoteItem from "../components/Notes/NoteItem"
import { RouteComponentProps } from "react-router"
import NoteFolderItem from "../components/Notes/NoteFolderItem"

interface NoteFolderPageProps extends RouteComponentProps<{
  path: string
}> {}

const NotesFolderPage: React.FC<NoteFolderPageProps> = ({match}) => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const path = match.params.path

  const [notes, setNotes] = useState<object[]>([])
  const [folders, setFolders] = useState([])

  useIonViewDidEnter(() => {
    getNotes()
    getFolderPaths()
  })

  function getNotes() {
    db.find({
      selector: {
        type: "note",
        "timestamps.updated": {
          "$gt": null
        },
        path: {
          "$regex": `,${path},`
        }
      },
      sort: [{'timestamps.updated': 'desc'}]
    })
    .then((result) => {
      let filteredNotes: object[] = []
      console.log("Notes", result.docs)
      if(result.docs && result.docs.length > 0) {
        result.docs.forEach(doc => {
          if(doc.path == `,${path},`) {
            filteredNotes.push(doc)
          }
        })
      }
      setNotes(filteredNotes)
    }).catch((err: Error) => {
      console.log(err)
    })
  }

  function getFolderPaths() {
    db.find({
      selector: {
        "type": "note",
        "path": {
          "$regex": `,${path},`
        }
      }
    }).then(result => {
      let root =  []
      if(result.docs.length > 0) {
        let data = result.docs!
        data.forEach(doc => {
          // let folder = doc.path.match(/,(.*?),/)
          // if(!root.includes(folder[1]) && folder[1] !== path) {
          //   root.push(folder[1])
          // }

          const folderPaths: string[] = doc.path.split(",")
          const pathSplit: string[] = path.split(",")
          if (folderPaths.length > 0) {
            // const index = folderPaths.findIndex(e => e == path) + 1
            const index = pathSplit.length + 1
            if(!root.find(r => r.current == folderPaths[index]) && folderPaths[index] !== "") {
              root.push({
                current: folderPaths[index],
                full: path + ',' + folderPaths[index],
              })
            }
          }
        })
      }
      setFolders(root)
    })
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Notes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonBreadcrumbs className="ion-padding">
          <IonBreadcrumb>
            <IonIcon icon={folderSharp}></IonIcon>
          </IonBreadcrumb>
          {
            path.split(",").map(p => {
              return (
                <IonBreadcrumb>{p}</IonBreadcrumb>
              )
            })
          }
        </IonBreadcrumbs>
        {
          folders.length > 0
          ? <IonList>
            {
              folders.map(folder => {
                return (
                  <NoteFolderItem key={folder.current} folder={folder} />
                )
              })
            }
          </IonList>
          : null
        }
        {
          notes.length > 0
          ?  <IonList>
            {
              notes.map(note => {
                return (
                  <NoteItem key={note._id} note={note} />
                )
              })
            }
          </IonList>
          : null
        }

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton routerLink="/notes/add">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default NotesFolderPage