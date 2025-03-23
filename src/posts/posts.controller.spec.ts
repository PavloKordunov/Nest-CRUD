import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtService } from '@nestjs/jwt';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService
  let jwtService: JwtService

  const mockPostsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getComments: jest.fn(),
    getReplies: jest.fn(),
    commentPost: jest.fn()
  }

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
    verify: jest.fn().mockReturnValue({ sub: 1, email: 'test@example.com' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {provide: PostsService, useValue: mockPostsService},
        {provide: JwtService, useValue: mockJwtService}
      ]
    }).compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService)
  });

  it('should be defined', () => {
    expect(postsController).toBeDefined();
  });

  it('should return all posts', async () => {
    const mockPosts = [
      {id: 1, title: "qwerty", description: "qweqwe", groupId: 1},
      {id: 2, title: "qwerty1", description: "qweqwe1", groupId: 1},
    ]

    mockPostsService.findAll.mockResolvedValue(mockPosts)

    const result = await postsController.findAll()

    expect(result).toEqual(mockPosts)
    expect(postsService.findAll).toHaveBeenCalledTimes(1)
  })

  it('should return an empty array if no posts found', async () => {
    mockPostsService.findAll.mockResolvedValue([])

    const result = await postsController.findAll()

    expect(result).toEqual([])
    expect(postsService.findAll).toHaveBeenCalledTimes(1)
  })
  
  it('should throw an error if findAll fails', async ( ) => {
    mockPostsService.findAll.mockRejectedValue(new InternalServerErrorException("Database error"))

    await expect(postsController.findAll()).rejects.toThrow(InternalServerErrorException)
    expect(postsService.findAll).toHaveBeenCalledTimes(1);
  })

  it('should return post by id', async () => {
    const postId = 1
    const mockPost = {id: postId, title: "qwerty", description: "qweqwe", groupId: 1}

    mockPostsService.findOne.mockResolvedValue(mockPost)

    const result = await postsController.findOne('1')

    expect(result).toEqual(mockPost)
    expect(postsService.findOne).toHaveBeenCalledWith(1)
    expect(postsService.findOne).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if post not found', async () => {
    mockPostsService.findOne.mockRejectedValue(new NotFoundException("Post not found"))

    await expect(postsController.findOne('99')).rejects.toThrow(NotFoundException)
    await expect(postsService.findOne).toHaveBeenCalledWith(99)
  })

  it('should throw an error if findOne fails', async ( ) => {
    mockPostsService.findOne.mockRejectedValue(new InternalServerErrorException("Database error"))

    await expect(postsController.findOne('99')).rejects.toThrow(InternalServerErrorException)
    expect(postsService.findOne).toHaveBeenCalledTimes(1);
  })

  it("should create a post", async () => {
    const mockPostDto = { title: "qwerty", description: "qweqwe", groupId: 1 };
    const mockPost = { id: 1, ...mockPostDto, user: { name: "Test User" } };
    const request = { user: { sub: 1 } };

    mockPostsService.create.mockResolvedValue(mockPost)

    const result = await postsController.create(mockPostDto, request)

    expect(result).toEqual(mockPost)
    expect(postsService.create).toHaveBeenCalledWith(mockPostDto, request.user.sub)
    expect(postsService.create).toHaveBeenCalledTimes(1)
  })

  it("should throw an error if post creation fails", async () => {
    const mockPostDto = { title: "qwerty", description: "qweqwe", groupId: 1 };
    const request = { user: { sub: 1 } };

    mockPostsService.create.mockRejectedValue(new InternalServerErrorException("Failed to create post"))

    await expect(postsController.create(mockPostDto, request)).rejects.toThrow(InternalServerErrorException)
    expect(postsService.create).toHaveBeenCalledWith(mockPostDto, request.user.sub)
    expect(postsService.create).toHaveBeenCalledTimes(1)
  })

  it('should return update post', async () => {
    const updateDto = {title: "asdasd"}
    const mockPost = {id: 1, title: "asdasd", description: "qweqwe", groupId: 1}
    mockPostsService.update.mockResolvedValue(mockPost)

    const result = await postsController.update('1', updateDto)

    expect(result).toEqual(mockPost)
    expect(postsService.update).toHaveBeenCalledWith(1, updateDto)
    expect(postsService.update).toHaveBeenCalledTimes(1)
  })

  it('should return not found post', async () => {
    const updateDto = {title: "asdasd"}
    mockPostsService.update.mockRejectedValue(new NotFoundException("Post not found"))

   await expect(postsController.update('99', updateDto)).rejects.toThrow(NotFoundException)
    expect(postsService.update).toHaveBeenCalledWith(99, updateDto)
    expect(postsService.update).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if update fails', async ( ) => {
    const updateDto = {title: "asdasd"}
    mockPostsService.update.mockRejectedValue(new InternalServerErrorException("Database error"))

    await expect(postsController.update('99', updateDto)).rejects.toThrow(InternalServerErrorException)
    expect(postsService.update).toHaveBeenCalledTimes(1);
  })

  it('should delete a post', async() => {
    const postId = '1'
    const mockPost = {id: 1, title: "asdasd", description: "qweqwe", groupId: 1}

    mockPostsService.delete.mockResolvedValue(mockPost)
    const result = await postsController.delete(postId)

    expect(result).toEqual(mockPost)
    expect(postsService.delete).toHaveBeenCalledWith(1)
    expect(postsService.delete).toHaveBeenCalledTimes(1)
  })

  it('should return NotFoundException if postId not found', async() => {
    const postId = "99"
    mockPostsService.delete.mockRejectedValue(new NotFoundException('Post not found'))

    await expect(postsController.delete(postId)).rejects.toThrow(NotFoundException)
    expect(postsService.delete).toHaveBeenCalledWith(99)
    expect(postsService.delete).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if delete fails', async() => {
    const postId = "99"
    mockPostsService.delete.mockRejectedValue(new InternalServerErrorException('Database error'))

    await expect(postsController.delete(postId)).rejects.toThrow(InternalServerErrorException)
    expect(postsService.delete).toHaveBeenCalledTimes(1)
  })

  it('should return paginated comments for a post', async () => {
    const postId = '1';
    const mockComments = {
      comments: [{ id: 1, text: 'Test comment', user: { name: 'John Doe' } }],
      total: 1,
      page: 1,
      limit: 10,
    };

    mockPostsService.getComments.mockResolvedValue(mockComments)

    const result = await postsController.getComments(postId, '1', '10')

    expect(result).toEqual(mockComments)
    expect(postsService.getComments).toHaveBeenCalledWith(1, 1, 10);
    expect(postsService.getComments).toHaveBeenCalledTimes(1);
  });

  it('should throw InternalServerErrorException on error', async () => {
    const postId = '1';
    mockPostsService.getComments.mockRejectedValue(new InternalServerErrorException('DB error'));

    await expect(postsController.getComments(postId, '1', '10')).rejects.toThrow(InternalServerErrorException);
    expect(postsService.getComments).toHaveBeenCalledWith(1, 1, 10);
    expect(postsService.getComments).toHaveBeenCalledTimes(1);
  })

  it('should return replies to comment Id', async() => {
    const commentId = "1"
    const mockReplies = {
      replies: [{ id: 2, text: 'Reply to comment', user: { name: 'Jane Doe' } }],
      total: 1,
      page: 1,
      limit: 5,
    };

    mockPostsService.getReplies.mockResolvedValue(mockReplies)

    const result = await postsController.getReplies(commentId, '1', '10')

    expect(result).toEqual(mockReplies)
    expect(postsService.getReplies).toHaveBeenCalledWith(1, 1, 10);
    expect(postsService.getReplies).toHaveBeenCalledTimes(1);
  })

  it('should throw InternalServerErrorException on error', async () => {
    const commentId = '1';
    mockPostsService.getReplies.mockRejectedValue(new InternalServerErrorException('DB error'));

    await expect(postsController.getReplies(commentId, '1', '5')).rejects.toThrow(InternalServerErrorException);
    expect(postsService.getReplies).toHaveBeenCalledWith(1, 1, 5);
    expect(postsService.getReplies).toHaveBeenCalledTimes(1);
  });

  it('should create a comment', async () => {
    const mockCommentDto = { text: 'Test comment', parentId: undefined };
    const postId = '1';
    const userId = 1;
    const request = { user: { sub: userId } };

    const mockComment = { id: 1, postId: +postId, userId, text: mockCommentDto.text, parentId: null };

    mockPostsService.commentPost.mockResolvedValue(mockComment);

    const result = await postsController.commentPost(postId, request, mockCommentDto);

    expect(result).toEqual(mockComment);
    expect(postsService.commentPost).toHaveBeenCalledWith(+postId, userId, mockCommentDto.text, mockCommentDto.parentId);
    expect(postsService.commentPost).toHaveBeenCalledTimes(1);
});

it('should throw NotFoundException if post does not exist', async () => {
    const mockCommentDto = { text: 'Test comment', parentId: undefined };
    const postId = '99';
    const userId = 1;
    const request = { user: { sub: userId } };

    mockPostsService.commentPost.mockRejectedValue(new NotFoundException(`Post with ID ${postId} not found`));

    await expect(postsController.commentPost(postId, request, mockCommentDto)).rejects.toThrow(NotFoundException);
    expect(postsService.commentPost).toHaveBeenCalledWith(+postId, userId, mockCommentDto.text, mockCommentDto.parentId);
    expect(postsService.commentPost).toHaveBeenCalledTimes(1);
});

it('should throw NotFoundException if parent comment does not exist', async () => {
    const mockCommentDto = { text: 'Reply comment', parentId: 99 };
    const postId = '1';
    const userId = 1;
    const request = { user: { sub: userId } };

    mockPostsService.commentPost.mockRejectedValue(new NotFoundException(`Parent comment with ID ${mockCommentDto.parentId} not found`));

    await expect(postsController.commentPost(postId, request, mockCommentDto)).rejects.toThrow(NotFoundException);
    expect(postsService.commentPost).toHaveBeenCalledWith(+postId, userId, mockCommentDto.text, mockCommentDto.parentId);
    expect(postsService.commentPost).toHaveBeenCalledTimes(1);
});

it('should throw InternalServerErrorException on database error', async () => {
    const mockCommentDto = { text: 'Test comment', parentId: undefined };
    const postId = '1';
    const userId = 1;
    const request = { user: { sub: userId } };

    mockPostsService.commentPost.mockRejectedValue(new InternalServerErrorException('Database error'));

    await expect(postsController.commentPost(postId, request, mockCommentDto)).rejects.toThrow(InternalServerErrorException);
    expect(postsService.commentPost).toHaveBeenCalledTimes(1);
});

  
});
