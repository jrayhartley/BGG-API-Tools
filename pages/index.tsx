import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { parseString } from "xml2js"; 
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [games, setGames] = useState()

  useEffect(() => {
    fetch('https://api.geekdo.com/xmlapi2/hot?type=boardgame&stats=1')
    .then(response => response.text())
    .then((data) => {
      //console.log('BGG API XML: ', data)
      let items: [] = []
      parseString(data, (err, results) => {
        //let json = JSON.stringify(results)
        //console.dir('BGG API Response: ', results.items.item)
        items = results.items.item
      })
      //console.log('BGG API Items: ',items)
      return items
    }).then(hotGames => {
      if (hotGames.length) {
        Promise.all(hotGames.map( async (game: any) => {
          const id: any = game.$.id
          const bg = await fetch(`https://api.geekdo.com/xmlapi2/thing?id=${id}&stats=1`)
          .then(response => response.text())
          .then((data: any) => {
            let bg: any = {}
            parseString(data, (err, results) => {
              //console.log('results: ', results.items.item)
              bg = results.items.item
            })
            //console.log('bg: ', bg)
            return bg[0]
          })
          return bg
        }))
        .then((data: any) => {
          //console.log("data: ", data)
          setGames(data)
        })
      }
    })
  }, [])

  const Game = ({game}: any) => {
    console.log("game: ", game)
    return (
      <div
        className={styles.game}
      >
        <a 
          href={`https://boardgamegeek.com/boardgame/${game.$.id}`} 
          target="_blank" 
          rel="noreferrer"
        >
          <div 
            className={styles.gameWrap}
          >
            <div>
              <Image  
                src={game.thumbnail[0]} 
                alt={game.name[0].$.value} 
                width='100' 
                height='100' 
              />
            </div>
            <div
              className={styles.gameContent}
            >
              <h3>
                {game.name[0].$.value}
              </h3>
              <h5>Complexity: {game.statistics[0].ratings[0].averageweight[0].$.value}</h5>
            </div>
          </div>
        </a>
      </div>
    )
    
  }

  const HotGames = ({games}: any) => {
    //console.log('games.info', games)
    if (games) {
      const sortedGames = games.sort((a: any,b: any) => {
        const aComplexity = a.statistics[0].ratings[0].averageweight[0].$.value
        const bComplexity = b.statistics[0].ratings[0].averageweight[0].$.value

        return aComplexity - bComplexity
      })
      return (
        <div
          className={styles.hotGames}
        >          
          {sortedGames.map((game: any, i: any) => {
            return <Game key={i} game={game} />
          })}
        </div>
      )
    }
    else {
      return null
    }
    
  }
    
  return (
    <>
      <Head>
        <title>Board Game Geek Hotness Tool</title>
        <meta name="description" content="Custom tools for finding board games" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div>
          <HotGames games={games} />
        </div>
      </main>
    </>
  )
}
