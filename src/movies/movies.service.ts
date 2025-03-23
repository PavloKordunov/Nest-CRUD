import { Injectable } from "@nestjs/common";
import { CacheService } from "src/cache/cache.service";

@Injectable()
export class MoviesService {
    private readonly API_URL = 'https://api.themoviedb.org/3/discover/movie';
    private readonly API_KEY = process.env.TMDB_API_KEY;

    constructor(private readonly cacheService: CacheService) {}

    async getUpcomingMovies(year: number, month?: number) {
        try {

            const cacheKey = `movies:${year}${month ? `-${month}` : ''}`;
            const cachedMovies = await this.cacheService.get(cacheKey);
      
            if (cachedMovies) {
              console.log(`Cache HIT for ${cacheKey}`);
              return cachedMovies;
            }
                  
            if (!this.API_KEY) {
                throw new Error('TMDB API key is not defined.');
            }

            let params = new URLSearchParams({
                api_key: this.API_KEY,
                primary_release_year: year.toString(),
                sort_by: 'popularity.desc',
            });

            if (month) {
                const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

                params.append('primary_release_date.gte', startDate);
                params.append('primary_release_date.lte', endDate);
            }

            const res = await fetch(`${this.API_URL}?${params.toString()}`);
            await this.cacheService.set(cacheKey, res, 86400);
            return res.json();
            
        } catch (error) {
            console.error('Error fetching movies:', error);
            throw new Error('Failed to fetch movies.');
        }
    }
}
