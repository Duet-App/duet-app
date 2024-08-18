
import { IonToast, useIonViewDidEnter } from '@ionic/react'
import React from 'react'

import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {

  // replaced dynamically
  const buildDate = new Date().toISOString()
  // replaced dyanmicaly
  const reloadSW = '__RELOAD_SW__'

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swURL, r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  useIonViewDidEnter(() => {

  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if(offlineReady) {
    console.log("Offline ready")
  }

  return (
    <>
      {
        needRefresh
        && <IonToast
          isOpen={true}
          message="App update available. Update to get latest features"
          buttons={[
            {
              text: 'Update',
              role: 'update',
              handler: () => {
                updateServiceWorker(true)
              }
            }
          ]}
        ></IonToast>
      }
      {
        offlineReady
        && <IonToast
          message="Ready to work offline"
          isOpen={true}
          duration={5000}
        ></IonToast>
      }
    </>
  )

  return (
    <div className="ReloadPrompt-container">
      { (offlineReady || needRefresh)
        && <div className="ReloadPrompt-toast">
            <div className="ReloadPrompt-message">
              { offlineReady
                ? <span>App ready to work offline</span>
                : <span>New content available, click on reload button to update.</span>
              }
            </div>
            { needRefresh && <button className="ReloadPrompt-toast-button" onClick={() => updateServiceWorker(true)}>Reload</button> }
            <button className="ReloadPrompt-toast-button" onClick={() => close()}>Close</button>
        </div>
      }
    </div>
  )
}

export default ReloadPrompt