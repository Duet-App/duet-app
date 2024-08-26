import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { pricetagOutline } from "ionicons/icons"
import { useEffect, useState } from "react"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'

const TagsPage: React.FC = () => {

  const db = new PouchDB('duet')
  PouchDB.plugin(PouchFind)

  const [allTags, setAllTags] = useState([])

  useEffect(() => {
    async function getAllTags() {
      const result = await db.query('tags-ddoc/all-tags', {
        group: true
      })
      if(result.rows) {
        const tags = []
        result.rows.forEach(row => {
          tags.push(row.key)
        });
        setAllTags(tags)
      }
    }
    getAllTags()
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle>Tags</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        <IonList>
          {
            allTags.map(tag => {
              return <IonItem key={tag}>
                <IonIcon slot="start" icon={pricetagOutline}></IonIcon>
                <IonLabel>{tag}</IonLabel>
              </IonItem>
            })
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default TagsPage