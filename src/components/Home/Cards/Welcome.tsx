import { IonCol, IonGrid, IonRow } from "@ionic/react"

import "./Welcome.css"

const Welcome: React.FC = () => {
  return (
    <>
      <IonGrid>
        <IonRow>
          <IonCol>
            <h3 className="welcome-text">Welcome</h3>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  )
}

export default Welcome