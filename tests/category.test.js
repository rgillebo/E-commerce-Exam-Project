const request = require('./setup');
const { Category } = require('../models');

describe('Category API', () => {
  let categoryId;
  let adminToken;

  beforeAll(async () => {
    const adminLoginResponse = await request.post('/admin/login')
      .send({
        username: 'admin',
        password: 'P@ssword2023'
      })
      .set('Accept', 'application/json');

    if (adminLoginResponse.body.success) {
      const loginTokenResponse = await request.post('/auth/login')
        .send({
          identifier: 'admin',
          password: 'P@ssword2023'
        })
        .set('Accept', 'application/json');
      adminToken = loginTokenResponse.body.data.token;
    } else {
      throw new Error('Admin login failed');
    }
  });

  it('should create a category', async () => {
    const response = await request.post('/admin/categories')
      .send({ name: 'TEST_CATEGORY' })
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');
    
    expect(response.status).toBe(200);
    expect(response.body.data.category.name).toBe('TEST_CATEGORY');
    categoryId = response.body.data.category.id;
  });

  it('should get the created category', async () => {
    const response = await request.get(`/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.data.category.name).toBe('TEST_CATEGORY');
  });

  it('should update the category name', async () => {
    const response = await request.put(`/admin/categories/${categoryId}`)
      .send({ name: 'UPDATED_TEST_CATEGORY' })
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    const updatedCategory = await Category.findByPk(categoryId);
    expect(updatedCategory.name).toBe('UPDATED_TEST_CATEGORY');
  });

  it('should delete the category', async () => {
    const response = await request.delete(`/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
  });

  it('should return 404 for deleted category', async () => {
    const response = await request.get(`/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
  });
});
