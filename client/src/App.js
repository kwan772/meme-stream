import './App.css';
import React, { useState, useEffect } from 'react';
import memeBGM from "./assets/memeBGM.mp3";
import useSound from 'use-sound';
import bellSound from "./assets/bell.mp3"


function App() {
  const [meme,setMeme] = useState([])
  const [currentMeme,setCurrentMeme] = useState(0)
  const [nextMeme,setNextMeme] = useState(currentMeme+1)
  const [seconds,setSeconds] = useState(15)
  const [displayCurrent, setDisplayCurrent] = useState(true)
  const [length,setLength] = useState()
  const CLOCK = 15
  const WEEK_IN_MS = 604800000
  const TEN_MIN_IN_MS = 600000
  const [onMusic,setOnMusic] = useState(false)
  const [bgm, setBgm] = useState(new Audio(memeBGM))
  const [auth,setAuth] = useState(false)
  const [pass,setPass] = useState()

  const play = () => {
    if(onMusic){
      setOnMusic(false)
      bgm.pause()
    }
    else{
      setOnMusic(true)
      bgm.play()
      bgm.loop = true
    
    }
      
      
  }

  useEffect(() => {
      getData()
  },[])


  useEffect(() => {
    setTimeout(() => {
      if(seconds!==0){
      setSeconds(seconds-1)}
      else{
        if(displayCurrent){
          setDisplayCurrent(false)
          if(length>(nextMeme+1)){

            setCurrentMeme(nextMeme+1)
            while(!meme[currentMeme].media && meme[currentMeme].media===''){
              setCurrentMeme(nextMeme+1)
            }
          
          }
          else{
            setMeme(shuffle(meme))
            setCurrentMeme(0)
          }

        }
        else{
          setDisplayCurrent(true)
          if(length>(currentMeme+1)){
            setNextMeme(currentMeme+1)
            while(!meme[nextMeme].media && meme[nextMeme].media===''){
              setCurrentMeme(nextMeme+1)
            }
          
          }
          else{
            setMeme(shuffle(meme))
            setNextMeme(0)
          }
        }
        setSeconds(CLOCK)
        
      }
    }, 1000);
    
  }, [seconds])

  useEffect(()=>{
    console.log(meme)
  },[meme])

  function shuffle(array) {
    let currentIndex = array.length
    let randomIndex

    while (currentIndex != 0) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    
    return array
      
    }

    const getData = () => {
      fetch("/members").then(
        res => res.json()
      )
      .then(data => {
        setLength(Object.keys(data.title).length)
        let shuffleMeme = []
        for (var i =0; i<Object.keys(data.title).length; i++){
      //   setMeme(preState => [
      //     ...preState, {media:data.media['?',i],
      //   score:data.score['?',i],
      // title:data.title['?',i]}
      //   ])
  
          shuffleMeme.push({media:data.media['?',i],
             score:data.score['?',i],
           title:data.title['?',i]})
  
  
      }
      setMeme(shuffle(shuffleMeme))
      if(shuffleMeme.length > 0) {
        fetch("/checkImage?src="+shuffleMeme[currentMeme].media)
        .then(res => {
          return res.json()
        })
        .then(isFound => {
          console.log(isFound)
          if (isFound === 404){
            setCurrentMeme(currentMeme+1)
            setNextMeme(currentMeme+2)
            console.log("skipped")
          }
        }) 
      }
      if(shuffleMeme.length > 0) {
        fetch("/checkImage?src="+shuffleMeme[nextMeme].media)
        .then(res => {
          return res.json()
        })
        .then(isFound => {
          console.log(isFound)
          if (isFound === 404){
            setNextMeme(nextMeme+1)
            console.log("skipped")
          }
        }) 
      }
      })
    }

    const updateData = () => {
      fetch("/updateMeme")
    }

    useEffect(() => {

      const currentTime = new Date().getTime();  //current unix timestamp
      const execTime = new Date().setHours(23,30,0);  //API call time = today at 20:00
      let timeLeft;
      if(currentTime < execTime) {
        //it's currently earlier than 20:00
        timeLeft = execTime - currentTime;
      } else {
        //it's currently later than 20:00, schedule for tomorrow at 20:00
        timeLeft = execTime + WEEK_IN_MS - currentTime
      }
      console.log(timeLeft)
      
      setTimeout(function() {

        updateData()
          setTimeout(function() {
            getData()
          }, TEN_MIN_IN_MS)

        setInterval(function() {
          updateData()
          setTimeout(function() {
            getData()
          }, TEN_MIN_IN_MS)
    
        }, WEEK_IN_MS);  //repeat every week
      }, timeLeft);  //wait until 20:00 as calculated above
    },[])

    useEffect(() => {
      if(meme.length > 0) {
      fetch("/checkImage?src="+meme[currentMeme].media)
      .then(res => {
        return res.json()
      })
      .then(isFound => {
        console.log(isFound)
        if (isFound === 404){
          if(length>(currentMeme+2)){
          setCurrentMeme(currentMeme+1)
          setNextMeme(currentMeme+2)
          console.log("skipped")
          }
          else{
            setMeme(shuffle(meme))
            setCurrentMeme(0)
          }
        }
      }) 
    }
    },[currentMeme])

    useEffect(() => {
      if(meme.length > 0) {
        fetch("/checkImage?src="+meme[nextMeme].media)
        .then(res => {
          return res.json()
        })
        .then(isFound => {
          console.log(isFound)
          if (isFound === 404){
            if(length>(nextMeme+2)){
              setNextMeme(nextMeme+1)
              setCurrentMeme(nextMeme+2)
              console.log("skipped")
            }
            else{
              setMeme(shuffle(meme))
              setNextMeme(0)
            }
          }
        })
      }
       
    },[nextMeme])


  return (
    <div className="App">
    

      {auth?
      <div>
       <header className="App-header">
       {meme[currentMeme+1]?        <div style={{height:"950px"}}>
 
         <div  style={displayCurrent?{height:"950px"}:{height:"950px",display:'none'}}>
             <h3>{meme[currentMeme].title.replace("fuck","****").replace("shit","****").replace("Bitch","*****").replace("Fuck","****").replace("Shit","****").replace("Bitch","*****").replace("FUCK","****").replace("SHIT","****").replace("BITCH","*****").replace("cunt","****").replace("CUNT","****").replace("Cunt","****").replace("nigger","*****").replace("NIGGER","*****").replace("Nigger","******")}</h3>
             <div className='memeBox'>
             <img alt="current meme" src={meme[currentMeme].media} onError={(e) => {
               if(length>(currentMeme+1)){
               if(currentMeme > nextMeme){
                 setCurrentMeme(currentMeme+1)
               }
               
               console.log(meme[currentMeme].media)
               console.log("error img")
               e.target.onerror = null
               e.target.src=meme[currentMeme].media
             }
             else{
               setMeme(shuffle(meme))
               setCurrentMeme(0)
               console.log("error img")
               e.target.onerror = null
               e.target.src=meme[currentMeme].media
             }}}></img>
             </div>
             </div>
 
             <div style={displayCurrent?{height:"950px",display:'none'}:{height:"950px"}}>
             <h3>{meme[nextMeme].title.replace("fuck","****").replace("shit","****").replace("Bitch","*****").replace("Fuck","****").replace("Shit","****").replace("Bitch","*****").replace("FUCK","****").replace("SHIT","****").replace("BITCH","*****").replace("cunt","****").replace("CUNT","****").replace("Cunt","****").replace("nigger","*****").replace("NIGGER","*****").replace("Nigger","******")}</h3>
             <div className='memeBox'>
             <img alt="next meme" src={meme[nextMeme].media} onError={(e) => {
               if(length>(nextMeme+1)){
                 setNextMeme(nextMeme+1)
                 console.log(meme[nextMeme].media)
                 console.log("error img")
                 e.target.onerror = null
                 e.target.src=meme[nextMeme].media
               }
               else{
                 setMeme(shuffle(meme))
                 setNextMeme(0)
                 console.log("error img")
                 e.target.onerror = null
                 e.target.src=meme[nextMeme].media
               }
             }}></img>
             </div>
             </div>
           </div>:null}
         <span className="timer">{seconds}</span>
       </header>
 
       {/* <img src={"https://i.redd.it/rs7pju6muo881.jpg"} 
       onError={({ currentTarget }) => {
         currentTarget.onerror = null; // prevents looping
         currentTarget.src="https://i.redd.it/u6anbsaoed381.jpg";
       }}
       
     ></img> */}
 
 <button onClick={play} style={{marginTop:1000}}>Boop!</button>
 </div>
:<div>Password: <input onChange={({target:{value}}) => {
  setPass(value)
}}></input> <button onClick={() => {
  if(pass === "goodfun") {
    setAuth(true)
  }
  else{
    setAuth(false)
  }
}}>submit</button></div>

}

     
    </div>
  );
}

export default App;
