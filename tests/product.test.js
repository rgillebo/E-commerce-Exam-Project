const request = require('./setup');
const { Product, Category } = require('../models');

describe('Product API', () => {
  let categoryId;
  let productId;
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

    const categoryResponse = await request.post('/admin/categories')
      .send({ name: 'TEST_CATEGORY' })
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');
    categoryId = categoryResponse.body.data.category.id;
  });

  it('should create a product', async () => {
    const response = await request.post('/admin/products')
      .send({
        name: 'TEST_PRODUCT',
        description: 'Test Description',
        price: 10,
        quantity: 5,
        category_id: categoryId,
        brand_id: 1
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.data.product.name).toBe('TEST_PRODUCT');
    productId = response.body.data.product.id;
  });

  it('should get the created product', async () => {
    const response = await request.get(`/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.data.product.name).toBe('TEST_PRODUCT');
  });

  it('should update the product name', async () => {
    const response = await request.put(`/admin/products/${productId}`)
      .send({ name: 'UPDATED_TEST_PRODUCT' })
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    const updatedProduct = await Product.findByPk(productId);
    expect(updatedProduct.name).toBe('UPDATED_TEST_PRODUCT');
  });

  it('should delete the product', async () => {
    const response = await request.delete(`/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
  });

  it('should return 404 for deleted product', async () => {
    const response = await request.get(`/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
  });
});
