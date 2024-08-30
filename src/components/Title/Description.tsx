import { useEffect, useRef, useState } from "react"
import './Description.css'
import Markdown from "react-markdown"
import { Keyboard } from "@capacitor/keyboard"

const Description = ({ description, update } : {description: string, update: (title: string) => void}) => {

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(description)

    Keyboard.addListener('keyboardWillHide', () => {
      if(document.activeElement === inputRef.current!) {
        inputRef.current!.blur()
      }
    })
  }, [])

  useEffect(() => {
    if(isEditing) {
      inputRef.current?.focus()
      inputRef.current!.selectionStart = content ? content.length : (description ? description.length : 0);
    }
  }, [isEditing])

  return (
    <>
      {
        isEditing
        ? <textarea
          ref={inputRef}
          className="description-editor-input"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if(e.target.value.length < content.length) {
              inputRef.current!.style.height = "auto"
              if(Math.ceil(inputRef.current!.scrollHeight / 26.4) > 1) {
                inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
              } else {
                inputRef.current!.style.height = "26.4px"
              }
            } else {
              inputRef.current!.style.height = "auto"
              inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
            }
          }}
          // onKeyDown={(e) => {
          //   if (e.key == 'Escape') {
          //     inputRef.current?.blur()
          //   } else if (e.key == 'Enter') {
          //     inputRef.current?.blur()
          //   }
          // }}
          onFocus={(e) => {
            inputRef.current!.style.height = "auto"
            inputRef.current!.style.overflowY = "hidden"
            inputRef.current!.rows = 1
            if(Math.ceil(inputRef.current!.scrollHeight / 26.4) > 1) {
              inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
            } else {
              inputRef.current!.style.height = "26.4px"
            }
          }}
          onBlur={(e) => {
            update(content)
            setIsEditing(false)
          }}
        >{description ?? ""}</textarea>
        : <>
          {
            description
            ? <>
              <div onClick={() => {setIsEditing(true)}}>
                <Markdown>
                  {description}
                </Markdown>
              </div>
            </>
            : <>
              <div style={{color: 'var(--ion-color-medium)'}} onClick={() => {setIsEditing(true)}}>
                <Markdown>
                  {'Tap to set a description'}
                </Markdown>
              </div>
            </>
          }
       </>
      }
    </>
  )
}

export default Description