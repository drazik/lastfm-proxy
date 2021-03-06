import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { fetchArtist, UnknownArtistError } from "App/Services/Lastfm"

export default class ArtistsController {
  public async index({request, response}: HttpContextContract) {
    const queryParams = request.get()
    const query = queryParams.q
    
    try {
      const artist = await fetchArtist(query)
      return artist
    } catch (err) {
      if (err instanceof UnknownArtistError) {
        return response.status(404)
      }

      throw err
    }
  }
}
