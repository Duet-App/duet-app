import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonRow, IonText, isPlatform, useIonViewDidEnter } from "@ionic/react"
import { useEffect, useState } from "react"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { endOfToday, format, formatISO, startOfToday } from "date-fns"

const Today: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet')
  }
  PouchDB.plugin(PouchFind)

  const [todaysDate, setTodaysDate] = useState(String)
  const [todaysTasksCount, setTodaysTasksCount] = useState(0)
  const [todaysTasksCompletedCount, setTodaysTasksCompletedCount] = useState(0)

  useEffect(() => {
    setTodaysDate(format(startOfToday(), 'E, do LLL'))
  }, [])

  useIonViewDidEnter(() => {
    async function getTodayCount() {
      const result = await db.find({
        selector: {
          type: "task",
          $or: [
            {status: "Next"},
            {
              status: "Done",
              timestamps: {
                completed: {
                  "$gte": formatISO(startOfToday()),
                  "$lte": formatISO(endOfToday())
                }
              }
            }
          ],
          scheduled_date: {
            "$lt": formatISO(endOfToday())
          },
        }
      })
      setTodaysTasksCount(result.docs.length)
    }

    async function getTodayCompletedCount() {
      const result = await db.find({
        selector: {
          status: "Done",
          type: "task",
          scheduled_date: {
            "$lt": formatISO(endOfToday())
          },
          timestamps: {
            completed: {
              "$gte": formatISO(startOfToday()),
              "$lte": formatISO(endOfToday())
            }
          }
        }
      })
      setTodaysTasksCompletedCount(result.docs.length)
    }

    getTodayCount()
    getTodayCompletedCount()
  })

  return (
    <>
      <IonCard routerLink="/today">
        <IonCardHeader>
          <IonCardTitle>Today's Tasks</IonCardTitle>
          <IonCardSubtitle>Scheduled or due on {todaysDate}</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonRow>
            <IonCol>
              <IonText color='primary'>
                <h1>{todaysTasksCompletedCount ?? 0}/{todaysTasksCount ?? 0}</h1>
                <p>Completed</p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>
    </>
  )
}

export default Today