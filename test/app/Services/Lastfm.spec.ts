import test from "japa"
import {
  getEndpointURL,
  fetchArtist,
  UnknownArtistError,
} from "App/Services/Lastfm"
import sinon from "sinon"
import axios from "axios"
import { URL } from "url"

test.group("getEndpointURL", () => {
  test("base URL should be correct", (assert) => {
    const url = getEndpointURL()

    assert.equal(url.origin, "http://ws.audioscrobbler.com")
  })

  test("should use lastfm api v2", (assert) => {
    const url = getEndpointURL()

    assert.equal(url.pathname, "/2.0/")
  })

  test("should use the given method in query string", (assert) => {
    const url = getEndpointURL({ method: "artist.getinfo" })

    assert.equal(url.searchParams.get("method"), "artist.getinfo")
  })

  test("should use the json format", (assert) => {
    const url = getEndpointURL({ method: "artist.getinfo" })

    assert.equal(url.searchParams.get("format"), "json")
  })

  test("should use the api key", (assert) => {
    const url = getEndpointURL({ method: "artist.getinfo" })

    assert.equal(url.searchParams.get("api_key"), process.env.LASTFM_API_KEY)
  })
})

test.group("fetchArtist", (group) => {
  const lastfmArtist = {
    artist: {
      name: "Daft Punk",
      tags: {
        tag: [
          {
            name: "electronic",
            url: "https://www.last.fm/tag/electronic"
          },
          {
            name: "dance",
            url: "https://www.last.fm/tag/dance"
          },
          {
            name: "house",
            url: "https://www.last.fm/tag/house"
          },
          {
            name: "electronica",
            url: "https://www.last.fm/tag/electronica"
          },
          {
            name: "techno",
            url: "https://www.last.fm/tag/techno"
          },
        ]
      },
      bio: {
        summary: "Daft punk summary bio",
        content: "Daft punk full bio",
      },
      similar: {
        artist: [
          { name: "Justice" },
          { name: "Stardust" },
          { name: "Thomas Bangalter" },
          { name: "Modjo" },
          { name: "Cassius" },
        ]
      }
    }
  }

  group.afterEach(() => {
    sinon.restore()
  })

  test("should call the lastfm API method.artist endpoint", async (assert) => {
    const axiosGet = sinon.fake.resolves({ data: lastfmArtist })
    sinon.replace(axios, "get", axiosGet)
    await fetchArtist("justice")

    const calledURL = new URL(axiosGet.lastCall.firstArg)
    assert.equal(calledURL.searchParams.get("method"), "artist.getinfo")
  })

  test("should pass the artist name in the query string", async (assert) => {
    const axiosGet = sinon.fake.resolves({ data: lastfmArtist })
    sinon.replace(axios, "get", axiosGet)
    await fetchArtist("daft punk")

    const calledURL = new URL(axiosGet.lastCall.firstArg)
    assert.equal(calledURL.searchParams.get("artist"), "daft punk")
  })

  test("returns artist name", async (assert) => {
    const axiosGet = sinon.fake.resolves({ data: lastfmArtist })
    sinon.replace(axios, "get", axiosGet)

    const artist = await fetchArtist("daft punk")

    assert.deepInclude(artist, { name: "Daft Punk" })
  })

  test("returns artist tags", async (assert) => {
    const axiosGet = sinon.fake.resolves({ data: lastfmArtist })
    sinon.replace(axios, "get", axiosGet)

    const artist = await fetchArtist("daft punk")

    assert.deepInclude(artist, { tags: lastfmArtist.artist.tags.tag })
  })

  test("returns artist bio", async (assert) => {
    const axiosGet = sinon.fake.resolves({ data: lastfmArtist })
    sinon.replace(axios, "get", axiosGet)

    const artist = await fetchArtist("daft punk")

    assert.deepInclude(artist, {
      bio: {
        summary: lastfmArtist.artist.bio.summary,
        full: lastfmArtist.artist.bio.content,
      }
    })
  })

  test("returns similar artists", async (assert) => {
    const axiosGet = sinon.fake.resolves({ data: lastfmArtist })
    sinon.replace(axios, "get", axiosGet)

    const artist = await fetchArtist("daft punk")

    assert.deepInclude(artist, {
      similar: ["Justice", "Stardust", "Thomas Bangalter", "Modjo", "Cassius"]
    })
  })

  test("throws an error when artist does not exist", async (assert) => {
    const axiosGet = sinon.fake.resolves({
      data: {
        error: 6,
        message: "The artist you supplied could not be found"
      }
    })
    sinon.replace(axios, "get", axiosGet)

    try {
      await fetchArtist("daft punk")
    } catch (err) {
      assert.instanceOf(err, UnknownArtistError)
    }
  })
})
