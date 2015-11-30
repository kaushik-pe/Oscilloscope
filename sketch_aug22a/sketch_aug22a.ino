int data;
int i;
String pinName, pinVal, delimiter=","; 
boolean digiChannels[8];
boolean anaChannels[6];
boolean flag=0;
char indata;
int sineflag = 0;
float sineRadian = 0;
String val;
void setup(){
Serial.begin(9600);
}
void loop(){
        if (Serial.available() > 0) {
         
          int pinsel = Serial.parseInt();
          if(pinsel < 15) {
            Serial.println("ack");
          }
          if(pinsel<8)
            {
              digiChannels[pinsel]?digiChannels[pinsel]=0:digiChannels[pinsel]=1;
            }
          else
            {
                if(pinsel==15)
                {
                  flag?flag=0:flag=1;
                }
                else
                { 
                anaChannels[pinsel-8]?anaChannels[pinsel-8]=0:anaChannels[pinsel-8]=1;
                }
            }

            if(pinsel == 16) {

                flag = 0;
                for(i=0;i<8;i++) {
                    digiChannels[i] = 0;
                  }
                for(i=0;i<6;i++) {
                    anaChannels[i] = 0;
                  }
              
              }
              if(pinsel==17)
              {
                 sineflag?sineflag=0:sineflag=1;
              }
            
        
         /*Serial.println("Digital Channels!!");
         for(i=0;i<8;i++)
          {
            Serial.println(digiChannels[i]);
          }
         Serial.println("Analog Channels!!");
          for(i=0;i<6;i++)
          {
            Serial.println(anaChannels[i]);
          }*/
         
     }
     if(sineflag)
     {
        float sineval = sin(sineRadian);
        val = String(sineval);
        Serial.println("s"+delimiter+val);
        sineRadian += 0.01;
     }
     if(flag)
     {
         for(i=0;i<8;i++)
         {
            if(digiChannels[i]==1)
            {
              data = digitalRead(i+2);
              pinName = String(i);
              pinVal = String(data);
              Serial.println(pinName+delimiter+pinVal);     
            }
          if(i<6)
            {
              if(anaChannels[i]==1)
              {
                data = analogRead(i+14);
                pinName = String(i+14);
                pinVal = String(data);
                Serial.println(pinName+delimiter+pinVal);   
               }
            }  
       } 
     } 
}



