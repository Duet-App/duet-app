import { IonItem, IonLabel, IonList, IonSkeletonText } from "@ionic/react"

const TasksSkeletonLoader = () => {
  return (
    <IonList>
      <IonItem>
        <div slot="start">
          <IonSkeletonText animated={true} style={{width: 24, height: 24, borderRadius: '50%'}}></IonSkeletonText>
        </div>
        <IonLabel>
          <IonSkeletonText animated={true}></IonSkeletonText>
          <IonSkeletonText animated={true} style={{width: '20%'}}></IonSkeletonText>
        </IonLabel>
      </IonItem>
      <IonItem>
        <div slot="start">
          <IonSkeletonText animated={true} style={{width: 24, height: 24, borderRadius: '50%'}}></IonSkeletonText>
        </div>
        <IonLabel>
          <IonSkeletonText animated={true}></IonSkeletonText>
          <IonSkeletonText animated={true} style={{width: '20%'}}></IonSkeletonText>
        </IonLabel>
      </IonItem>
      <IonItem lines="none">
        <div slot="start">
          <IonSkeletonText animated={true} style={{width: 24, height: 24, borderRadius: '50%'}}></IonSkeletonText>
        </div>
        <IonLabel>
          <IonSkeletonText animated={true}></IonSkeletonText>
          <IonSkeletonText animated={true} style={{width: '20%'}}></IonSkeletonText>
        </IonLabel>
      </IonItem>
    </IonList>
  )
}

export default TasksSkeletonLoader