import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Get('upcoming')
    async getUpcomingMovies(@Query('year') year: string, @Query('month') month?: string){
        const yearNumber = parseInt(year);
        const monthNumber = month ? parseInt(month) : undefined;
        return this.moviesService.getUpcomingMovies(yearNumber, monthNumber)
    }
}
