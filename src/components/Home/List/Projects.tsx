import { IonCol, IonGrid, IonItem, IonLabel, IonRow, IonSpinner, IonText, useIonViewDidEnter } from "@ionic/react"
import './Projects.css'
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useState } from "react"

const ProjectsTile: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  useIonViewDidEnter(() => {
    getProjects()
  })

  function getProjects() {
    setFetched(false)
    db.find({
      selector: {
        "timestamps.updated": {
          "$gt": null
        },
        type: "project",
      },
      sort: [{'timestamps.updated': 'desc'}],
      limit: 3
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