import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonListHeader } from "@ionic/react"
import { calendarSharp, checkmarkCircleSharp, fileTraySharp, pauseCircleSharp, starSharp } from "ionicons/icons"
import ProjectsTile from "./List/Projects"
import NotesTile from "./List/Notes"

const HomeListUI = () => {
  return (
    <>
      <IonList>
        <IonItem button routerLink="/inbox">
          <IonIcon slot="start" style={{color: '#2196F3'}} icon={fileTraySharp} />
          <IonLabel>Inbox</IonLabel>
        </IonItem>
        <IonItem button routerLink="/today">
          <IonIcon slot="start" style={{color: '#F9A825'}} icon={starSharp} />
          <IonLabel>Today</IonLabel>
        </IonItem>
        <IonItem button routerLink="/actionable">
          <IonIcon slot="start" style={{color: '#689F38'}} icon={checkmarkCircleSharp} />
          <IonLabel>Actionable</IonLabel>
        </IonItem>
        <IonItem button routerLink="/waiting">
          <IonIcon slot="start" color="medium" icon={pauseCircleSharp} />
          <IonLabel>Waiting for</IonLabel>
        </IonItem>
        <IonItem button lines="none" routerLink="/upcoming">
          <IonIcon slot="start" style={{color: '#F44336'}} icon={calendarSharp} />
          <IonLabel>Upcoming</IonLabel>
        </IonItem>
      </IonList>

      <IonList style={{marginTop: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <IonListHeader style={{flex: '1 1 0'}}>Projects</IonListHeader>
          <IonButton size="small" fill="clear" routerLink="/project">See all</IonButton>
        </div>
        <ProjectsTile />
      </IonList>

      <IonList style={{marginTop: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <IonListHeader style={{flex: '1 1 0'}}>Notes</IonListHeader>
          <IonButton size="small" fill="clear" routerLink="/notes">See all</IonButton>
        </div>
        <NotesTile />
      </IonList>
    </>
  )
}

export default HomeListUI