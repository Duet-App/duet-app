import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { checkmarkCircle, chevronForwardCircle, closeCircle, ellipseOutline, pauseCircle } from "ionicons/icons";
import '../../taskList.css'

const StatusPickerModal = ({ dismiss }: { dismiss: (data?: string | null | undefined | number, role?: string) => void }) => {
  return (
    <div className="statusPickerModal">
      <h4 style={{padding: '12px 16px 6px'}}>Change status</h4>
      <IonList>
        <IonItem lines="none" button detail={false} onClick={() => dismiss("Todo", 'confirm')}>
          <IonIcon color="medium" icon={ellipseOutline} slot="start"></IonIcon>
          <IonLabel>Todo</IonLabel>
        </IonItem>
        <IonItem lines="none" button detail={false} onClick={() => dismiss("Next", 'confirm')}>
          <IonIcon color="primary" icon={chevronForwardCircle} slot="start"></IonIcon>
          <IonLabel>Next</IonLabel>
        </IonItem>
        <IonItem lines="none" button detail={false} onClick={() => dismiss("Waiting", 'confirm')}>
          <IonIcon color="medium" icon={pauseCircle} slot="start"></IonIcon>
          <IonLabel>Waiting</IonLabel>
        </IonItem>
        <IonItem lines="none" button detail={false} onClick={() => dismiss("Done", 'confirm')}>
          <IonIcon color="success" icon={checkmarkCircle} slot="start"></IonIcon>
          <IonLabel>Done</IonLabel>
        </IonItem>
        <IonItem lines="none" button detail={false} onClick={() => dismiss("Cancelled", 'confirm')}>
          <IonIcon color="medium" icon={closeCircle} slot="start"></IonIcon>
          <IonLabel>Cancelled</IonLabel>
        </IonItem>
      </IonList>
      <div style={{padding: 8}}></div>
    </div>
  );
};

export default StatusPickerModal