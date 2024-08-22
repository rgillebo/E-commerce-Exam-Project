const request = require('./setup');

describe('Auth API', () => {
  it('should login with valid user credentials', async () => {
    const response = await request.post('/auth/login')
      .send({
        identifier: 'Testuser',
        password: 'securepassword'
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.data.result).toBe('You are logged in');
    expect(response.body.data.token).toBeDefined();
  });

  it('should not login with invalid user credentials', async () => {
    const response = await request.post('/auth/login')
      .send({
        identifier: 'Testuser',
        password: 'wrongpassword'
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.data.result).toBe('Invalid credentials');
  });

  it('should login with valid admin credentials', async () => {
    const response = await request.post('/admin/login')
      .send({
        username: 'admin',
        password: 'P@ssword2023'
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful. Redirecting to products page...');
  });

  it('should not login with invalid admin credentials', async () => {
    const response = await request.post('/admin/login')
      .send({
        username: 'admin',
        password: 'wrongpassword'
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
