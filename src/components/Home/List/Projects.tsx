import { IonCol, IonGrid, IonItem, IonLabel, IonRow, IonSpinner, IonText, isPlatform, useIonViewDidEnter } from "@ionic/react"
import './Projects.css'
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { useState } from "react"
import { projects_progress_ddoc } from "../../../dbHelper"

const ProjectsTile: React.FC = () => {

  let db: PouchDB.Database

  if(isPlatform('capacitor')) {
    document.addEventListener('deviceready', async function () {
      PouchDB.plugin(CordovaSqlite)
      db = new PouchDB('duet', {adapter: "cordova-sqlite"});
    })
  } else {
    db = new PouchDB('duet');
  }
  PouchDB.plugin(PouchFind)


  useIonViewDidEnter(() => {
    if(isPlatform('capacitor')) {
      document.addEventListener('deviceready', async function() {
        getProjectsProgress()
      })
    } else {
      getProjectsProgress()
    }
  })

  async function getProjects() {
    try{
      await db.createIndex({
        index: {
          fields: ['timestamps.updated'],
        }
      })
      const result = await db.find({
        selector: {
          "timestamps.updated": {
            "$gt": null
          },
          type: "project",
        },
        sort: [{'timestamps.updated': 'desc'}],
        limit: 3
      })
      if(result) {
        setProjects(result.docs)
        if(!initiallyFetched) {
          setInitiallyFetched(true)
        }
        setFetched(true)
      }
    } catch(err) {
      throw err
    }
  }

  async function getProjectsProgress() {
    setFetched(false)
    try {
      await db.put(projects_progress_ddoc)
    } catch (err) {
      if(err.name !== 'conflict') {
        throw err
      }
    }
    const result = await db.query('projects-progress-ddoc/project-progress', {
      group: true
    })
    if(result.rows) {
      setProjectsProgress(result.rows)
      await getProjects()
    }
  }

  const [projects, setProjects] = useState([])
  const [projectsProgress, setProjectsProgress] = useState([])
  const [fetched, setFetched] = useState(false)
  const [initiallyFetched, setInitiallyFetched] = useState(false)

  if(!fetched && !initiallyFetched) {
    return (
      <IonGrid>
        <IonRow className="ion-justify-content-center">
          <IonCol size="auto">
            <IonSpinner></IonSpinner>
          </IonCol>
        </IonRow>
      </IonGrid>
    )
  }

  return (
    <>
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
          <IonText color="medium">No projects found!</IonText>
        </div>
      }
    </>
  ) 
}

export default ProjectsTile