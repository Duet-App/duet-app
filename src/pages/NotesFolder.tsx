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

interface IDuetFolder {
  current: string,
  full: string
}

interface IDuetNotes extends PouchDB.Core.ExistingDocument<{
  title: string,
  description: string,
  project_id?: string,
  path?: string,
  type: string,
  timestamps: {
    created: string,
    updated: string
  }
}> {}

interface IDuetProject extends PouchDB.Core.ExistingDocument<{
  title: string,
  description: string,
  type: string,
  status: string,
  timestamps: {
    created: string,
    updated: string,
    completed?: string,
    archived?: string
  }
}> {}

const NotesFolderPage: React.FC<NoteFolderPageProps> = ({match}) => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const path = match.params.path

  const [notes, setNotes] = useState<IDuetNotes[]>([])
  const [folders, setFolders] = useState<IDuetFolder[]>([])
  const [allProjects, setAllProjects] = useState<IDuetProject[]>([])

  useIonViewDidEnter(() => {
    getNotes()
    getProjects()
    getFolderPaths()
  })

  function getNotes() {
    if(path.split(",").at(0) == "Projects") {
      let project_id = path.split(",").at(1)
      if(path.split(",").length > 1) {
        db.find({
          selector: {
            type: "note",
            "timestamps.updated": {
              "$gt": null
            },
            project_id: project_id
          },
          sort: [{'timestamps.updated': 'desc'}]
        }).then(result => {
          let filteredNotes: IDuetNotes[] = []
          let docs: IDuetNotes[] = result.docs as IDuetNotes[]
          if(docs && docs.length > 0) {
            docs.forEach(doc => {
              filteredNotes.push(doc)
            })
          }
          setNotes(filteredNotes)
        }).catch((err: Error) => {
          console.log(err)
        })
      }
    } else {
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
        let filteredNotes: IDuetNotes[] = []
        let docs: IDuetNotes[] = result.docs as IDuetNotes[]
        if(docs && docs.length > 0) {
          docs.forEach(doc => {
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
  }

  function getProjects() {
    db.find({
      selector: {
        type: "project",
      }
    }).then(result => {
      setAllProjects(result.docs as IDuetProject[])
    })
  }

  function getFolderPaths() {
    if(path.split(",").at(0) == "Projects") {
      let projects: IDuetProject[] = []
      db.find({
        selector: {
          type: "project",
        }
      }).then(result => {
        projects = result.docs as IDuetProject[]
      })
      db.find({
        "selector": {
          type: "note",
          project_id: {
            "$exists": true,
            "$ne": ""
          }
        }
      }).then(result => {
        let folders: IDuetFolder[] = []
        if(result.docs.length > 0) {
          let data: IDuetNotes[] = result.docs as IDuetNotes[]
          if(path.split(",").length == 1) {
            data.forEach(doc => {
              if(folders.length == 0) {
                folders.push({
                  current: projects.find(p => p._id == doc.project_id)?.title!,
                  full: `Projects,${doc.project_id}`
                })
              } else if(folders.find(f => f.full.split(",").at(1) != doc.project_id)) {
                folders.push({
                  current: projects.find(p => p._id == doc.project_id)?.title!,
                  full: `Projects,${doc.project_id}`
                })
              }
            })
          } else {
            data.forEach(doc => {
              if(folders.length == 0) {

              }
            })
          }
        }
        setFolders(folders)
      })
    } else {
      db.find({
        selector: {
          "type": "note",
          "path": {
            "$regex": `,${path},`
          }
        }
      }).then(result => {
        let root: IDuetFolder[] =  []
        if(result.docs.length > 0) {
          let data = result.docs!
          data.forEach(doc => {
            const folderPaths: string[] = doc.path.split(",")
            const pathSplit: string[] = path.split(",")
            if (folderPaths.length > 0) {
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
            path.split(",").map((p, i) => {
              if(path.split(",").at(0) == "Projects" && i == 1) {
                return (
                  <IonBreadcrumb>
                    {
                      allProjects.find(a => a._id == p)?.title
                    }
                  </IonBreadcrumb>
                )
              } else {
                return (
                  <IonBreadcrumb>{p}</IonBreadcrumb>
                )
              }
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