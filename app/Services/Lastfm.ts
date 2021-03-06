import { URL, URLSearchParams } from "url"
import axios from "axios"
import Env from '@ioc:Adonis/Core/Env'

type EndpointURLParams = {
  method?: string,
}

type EndpointQuery = Record<string, string>

export const getEndpointURL = (
  { method }: EndpointURLParams = {},
  query: EndpointQuery = {}
) => {
  const BASE_URL = "http://ws.audioscrobbler.com/2.0/"
  const url = new URL(BASE_URL)
  
  const searchParams = new URLSearchParams()
  
  if (method) {
    searchParams.append("method", method)
  }

  Object.entries(query).forEach(([key, value]) => {
    searchParams.append(key, value)
  })

  searchParams.append("format", "json")
  searchParams.append("api_key", Env.get("LASTFM_API_KEY"))
  searchParams.append("lang", "FR")

  url.search = searchParams.toString()

  return url
}

export const fetchArtist = async (artistName: string) => {
  const url = getEndpointURL(
    { method: "artist.getinfo" },
    { artist: artistName }
  )

  const { data: artistInfos }: any = await axios.get(url.toString())

  if (artistInfos.error) {
    if (artistInfos.error === 6) {
      throw new UnknownArtistError()
    }
  }

  const artist = {
    name: artistInfos.artist.name,
    tags: artistInfos.artist.tags.tag,
    bio: {
      summary: artistInfos.artist.bio.summary,
      full: artistInfos.artist.bio.content,
    },
    similar: artistInfos.artist.similar.artist.map(
      (artist: { name: string }) => artist.name
    )
  }

  return artist
}

export class UnknownArtistError extends Error {
  constructor(...params: any[]) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownArtistError)
    }

    this.name = "UnknownArtistError"
  }
}
