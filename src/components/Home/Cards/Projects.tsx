import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonRow, IonText, isPlatform, useIonViewDidEnter } from "@ionic/react"
import { useEffect, useState } from "react"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { endOfToday, formatISO } from "date-fns"

const ProjectsCard: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet')
  }
  PouchDB.plugin(PouchFind)

  const [upcomingTasksCount, setUpcomingTasksCount] = useState(0)

  useIonViewDidEnter(() => {
    async function getUpcomingTasksCount() {
      const result = await db.find({
        selector: {
          type: "project",
        }
      })
      setUpcomingTasksCount(result.docs.length)
    }

    getUpcomingTasksCount()
  })

  return (
    <>
      <IonCard routerLink="/project">
        <IonCardHeader>
          <IonCardTitle>Projects</IonCardTitle>
          <IonCardSubtitle>Many actions, single outcome</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonRow>
            <IonCol>
              <IonText color='primary'>
                <h1>{upcomingTasksCount}</h1>
                <p>On-going Projects</p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>
    </>
  )
}

export default ProjectsCard