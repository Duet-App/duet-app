import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonRow, IonSpinner, IonText, IonTitle, IonToolbar, isPlatform, useIonViewDidEnter } from "@ionic/react"
import { add, ellipsisVerticalCircleOutline, ellipsisVerticalOutline, ellipsisVerticalSharp } from "ionicons/icons"
import './Projects.css'
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { useState } from "react"

const ProjectsPage: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet');
  }
  PouchDB.plugin(PouchFind)

  useIonViewDidEnter(() => {
    function getProjects() {
      setFetched(false)
      db.find({
        selector: {
          type: "project",
          "timestamps.updated": {
            "$gt": null
          }
        },
        sort: [{'timestamps.updated': 'desc'}]
      })
      .then((result: object | null) => {
        if(result) {
          setProjects(result.docs)
          getProjectsProgress()
        }
      }).catch((err: Error) => {
        console.log(err)
      })
    }

    async function getProjectsProgress() {
      db.query('projects-progress-ddoc/project-progress', {
        group: true
      }).then((result) => {
        if(result.rows) {
          console.log(result)
          setProjectsProgress(result.rows)
          if(!initiallyFetched) {
            setInitiallyFetched(true)
          }
          setFetched(true)
        }
      }).catch((err: Error) => {
        console.log(err)
      })
    }

    getProjects()
  })

  const [projects, setProjects] = useState([])
  const [projectsProgress, setProjectsProgress] = useState([])
  const [fetched, setFetched] = useState(false)
  const [initiallyFetched, setInitiallyFetched] = useState(false)

  if(!fetched && !initiallyFetched) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot='start'>
              <IonBackButton defaultHref="/"></IonBackButton>
            </IonButtons>
            <IonTitle>Projects</IonTitle>
            <IonButtons slot='end'>
              <IonButton id="openFilterBottomSheet">
                <IonIcon slot="icon-only" icon={ellipsisVerticalSharp}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="auto">
                <IonSpinner></IonSpinner>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Projects</IonTitle>
          <IonButtons slot='end'>
            <IonButton id="openFilterBottomSheet">
              <IonIcon slot="icon-only" icon={ellipsisVerticalSharp}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {
            projects.length > 0
            ? projects.map((project, index) => {
              return (
                <IonItem key={project._id} routerLink={"/project/details/" + project._id} lines={index == projects.length - 1 ? "none" : "inset"}>
                  <div
                    style={
                      {
                        '--duet-project-progress': (project.tasks ? ( projectsProgress.find(p => p.key == project._id).value.complete / projectsProgress.find(p => p.key == project._id).value.total * 100 ) : 0)
                      }
                    }
                    className="project-progress"
                  ></div>
                  <IonLabel>{project.title}</IonLabel>
                </IonItem>
              )
            })
            : <div className="ion-padding">
              <IonText color="medium">No projects found! Create a new project by pressing the + button below.</IonText>
            </div>
          }
        </IonList>

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton routerLink="/project/add">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  ) 
}

export default ProjectsPage