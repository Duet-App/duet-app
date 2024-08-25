import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonRow, IonText, useIonViewDidEnter } from "@ionic/react"
import { useEffect, useState } from "react"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import { endOfToday, formatISO } from "date-fns"

const UpcomingCard: React.FC = () => {

  const db = new PouchDB('duet')
  PouchDB.plugin(PouchFind)

  const [upcomingTasksCount, setUpcomingTasksCount] = useState(0)

  useEffect(() => {
    async function getUpcomingTasksCount() {
      const result = await db.find({
        selector: {
          "$or": [
            {status: "Todo"},
            {status: "Next"},
          ],
          type: "task",
          scheduled_date: {
            "$gt": formatISO(endOfToday()),
          },
        }
      })
      setUpcomingTasksCount(result.docs.length)
    }

    getUpcomingTasksCount()
  }, [])

  useIonViewDidEnter(() => {
    async function getUpcomingTasksCount() {
      const result = await db.find({
        selector: {
          "$or": [
            {status: "Todo"},
            {status: "Next"},
          ],
          type: "task",
          scheduled_date: {
            "$gt": formatISO(endOfToday()),
          },
        }
      })
      setUpcomingTasksCount(result.docs.length)
    }

    getUpcomingTasksCount()
  })

  return (
    <>
      <IonCard routerLink="/upcoming">
        <IonCardHeader>
          <IonCardTitle>Upcoming Tasks</IonCardTitle>
          <IonCardSubtitle>Scheduled or due in the future</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonRow>
            <IonCol>
              <IonText color='primary'>
                <h1>{upcomingTasksCount}</h1>
                <p>{upcomingTasksCount == 1 ? 'Task' : 'Tasks'}</p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>
    </>
  )
}

export default UpcomingCard