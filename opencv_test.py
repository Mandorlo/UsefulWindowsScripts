import numpy as np
import cv2

cap = cv2.VideoCapture('video.mp4')

if (cap.isOpened()== False):  
  print("Error opening video  file")

while(cap.isOpened()):
    ret, frame = cap.read()

    #gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)


    cv2.imshow('frame',gray)
    k = cv2.waitKey(1) & 0xFF
    if k == ord('q'):
        break
    elif k == ord(''):
        

cap.release()
cv2.destroyAllWindows()